const express = require('express');
const router = express.Router({ mergeParams: true });
const knex = require('../01_Database/connection');
const fs = require('fs');

const deleteRoute = require('./RouteCreaters/delete');
const postRoute = require('./RouteCreaters/post');
const postFunctionRoute = require('./RouteCreaters/post_function');
const getRoute = require('./RouteCreaters/get');
const getTableRoute = require('./RouteCreaters/getTable');
const putRoute = require('./RouteCreaters/put');

const database = require('../01_Database/database');
const postWorkordersItemsDB = database.postWorkordersItemsDB;
const getWorkordersItemsDB = database.getWorkordersItemsDB;
const getWorkordersItemsDetailsDB = database.getWorkordersItemsDetailsDB;
const postWorkordersItemsDetailsDB = database.postWorkordersItemsDetailsDB;

const complicated_functions = require('../02.1_Complicated_Route_Functions/workorders_items_add_fn');
const workorders_items_add_fn = complicated_functions.workorders_items_add_fn;

const datefns = require('date-fns');
const today_now = datefns.format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

// JOINED ROUTES   ///////////////////////////////////////////////////////////////////////////////////////////////
// WORKORDER ITEMS DETAILS
router.use('/:id/workorders_items_details', require('./workorders_items_details'));

// /workorders_items -> GET ALL
router.get('/', async (req, res) => {
	const { id } = req.params;

	const getEntry = await knex(getWorkordersItemsDB)
		.select('*')
		.where(`workorder_id`, '=', id)
		.andWhere('deleted', '=', 0)
		.orderBy('workorder_item_line_item', 'asc');
	console.log('getEntry');
	res.json(getEntry);
});

// /workorders/:id/workorders_items -> PATCH -> TABLE -> get all workorders items paginated
getTableRoute.getTableData(router, getWorkordersItemsDB);

// /workorders/:id/workorders_items -> POST -> create new workorder item + detail for that item
router.post('/', async (req, res) => {
	const { values, user_id } = req.body;
	let getCount;
	try {
		if (values.workorder_item_line_item === false && !values.pipe_id) {
			const count = await knex(getWorkordersItemsDB)
				.count()
				.where({ workorder_id: values.workorder_id })
				.andWhereRaw('pipe_id IS NULL')
				.returning('count');

			getCount = parseInt(count[0].count) + 1;
		} else if (values.workorder_item_line_item === false) {
			// gets Count for pipes
			const count = await knex(getWorkordersItemsDB)
				.count()
				.where({ workorder_id: values.workorder_id })
				.andWhereRaw('pipe_id IS NOT NULL')
				.returning('count');
			getCount = parseInt(count[0].count) + 1;
		} else {
			getCount = values.workorder_item_line_item;
		}

		console.log({ ...values, workorder_item_line_item: getCount });

		const newEntryId = await knex(postWorkordersItemsDB)
			.insert({ ...values, workorder_item_line_item: getCount + 1 })
			.returning('workorder_item_id');

		res.json({ ...values, workorder_item_line_item: getCount + 1 });
	} catch (e) {
		console.log(e);
	}
});

// /workorders/:id/workorders_items/:id -> GET -> get one workorder item
router.get('/:id', async (req, res) => {
	const { id } = req.params;
	const { pdf, helix } = req.query;

	if (pdf) {
		let drawingName;
		switch (helix) {
			case 4:
				drawing = 'Shop_Drawing_4_helix_R3.pdf';
				break;
			case 3:
				drawing = 'Shop_Drawing_3_helix_R3.pdf';
				break;
			case 2:
				drawing = 'Shop_Drawing_2_helix_R3.pdf';
				break;
			default:
				drawing = 'Shop_Drawing_1_helix_R3.pdf';
				break;
		}
		var file = fs.createReadStream(`./public/WorkordersPdfs/${drawingName}`);
		file.pipe(res);
	} else {
		const getEntry = await knex(getWorkordersItemsDB)
			.select('*')
			.where('workorder_item_id', '=', id);
		res.json(getEntry);
	}
});

// /workorders/:id/workorders_items/:id -> PUT -> edit one workorder item
putRoute.editById(
	router,
	getWorkordersItemsDB,
	postWorkordersItemsDB,
	today_now,
	'workorder_item_id'
);

// /workorders/:id/workorders_items/:id -> DELETE -> delete one workorder item
// deleteRoute.deleteRoute(router, postWorkordersItemsDB, today_now, 'workorder_item_id');

router.delete('/:id', async (req, res) => {
	const { id } = req.params;
	const { user_id } = req.body;

	const deletedEntry = await knex(postWorkordersItemsDB)
		.update({ deleted_by_id: user_id, deleted_on: today_now, deleted: 1 })
		.where('workorder_item_id', '=', id);

	res.json({ deletedEntry });
});

// /workorders/:id/workorder_items/:id -> PATCH -> TABLE -> get projects by that contact paginated
getTableRoute.getTableData_ById(
	router,
	'workorder_items_details',
	getWorkordersItemsDB,
	'workorder_item_id',
	getWorkordersItemsDetailsDB,
	'workorder_item_id'
);

module.exports = router;
