const express = require('express');
const router = express.Router({ mergeParams: true });
const knex = require('../01_Database/connection');

const deleteRoute = require('./RouteCreaters/delete');
const postRoute = require('./RouteCreaters/post');
const getRoute = require('./RouteCreaters/get');
const getTableRoute = require('./RouteCreaters/getTable');
const putRoute = require('./RouteCreaters/put');

const database = require('../01_Database/database');
const getWorkordersItemsDetailsDB = database.getWorkordersItemsDetailsDB;
const postWorkordersItemsDetailsDB = database.postWorkordersItemsDetailsDB;
const getMaterialTrackingDetails = database.getMaterialTrackingDetails;

const datefns = require('date-fns');

const today_now = datefns.format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

// JOINED ROUTES   ///////////////////////////////////////////////////////////////////////////////////////////////
// WORKORDER ITEMS DETAILS WELDERS
router.use('/:id/welders', require('./workorders_items_details_welders'));
// WORKORDER ITEMS DETAILS QUESTIONS
router.use('/:id/questions', require('./workorders_items_details_questions'));
// WORKORDER ITEMS DETAILS INSPECTIONS
router.use('/:id/inspections', require('./workorders_items_details_inspections'));

// /workorders/:id/workorder_items/:id/workorders_items_details -> GET ALL
router.get('/', async (req, res) => {
	const { id } = req.params;
	const { type } = req.query;
	let getEntry;
	if (type === 'pile_name') {
		getEntry = await knex(getWorkordersItemsDetailsDB)
			.select('workorder_item_detail_name')
			.where(`workorder_item_id`, '=', id)
			.orderBy('workorder_item_detail_line_item', 'asc');
	} else {
		getEntry = await knex(getWorkordersItemsDetailsDB)
			.select('*')
			.where(`workorder_item_id`, '=', id)
			.orderBy('workorder_item_detail_line_item', 'asc');
	}

	res.json(getEntry);
});

// /workorders/:id/workorder_items/:id/workorders_items_details -> PATCH -> TABLE -> get all workorders items paginated

router.get(`/table`, async (req, res) => {
	const page = req.query.page;
	const perPage = req.query.perPage;
	const workorder_id = req.query.workorderid;
	const workorder_item_id = req.query.workorderitemid;

	const paginatedTable = await knex(getWorkordersItemsDetailsDB)
		.where('workorder_id', '=', workorder_id)
		.andWhere('workorder_item_id', '=', workorder_item_id)
		.paginate({
			perPage: perPage,
			currentPage: page,
			isLengthAware: true,
		});

	paginatedTable.data.map((i) => {
		const newWelderId = [];
		i.welder_ids.map((i) => i !== null && newWelderId.push(i));
		i.welder_ids = newWelderId;
	});

	console.log(paginatedTable.data.map((i) => console.log('i.welder_ids', i.welder_ids)));
	res.json(paginatedTable);
});

// /workorders/:id/workorder_items/:id/workorders_items_details -> POST -> create new workorder item
postRoute.newEntry(
	router,
	getWorkordersItemsDetailsDB,
	postWorkordersItemsDetailsDB,
	today_now,
	'workorder_item_detail_id'
);

// /workorders/:id/workorder_items/:id/workorders_items_details/:id -> GET -> get one workorder item
getRoute.getById(router, getWorkordersItemsDetailsDB, 'workorder_item_detail_id');

// /workorders/:id/workorder_items/:id/workorders_items_details/:id -> PUT -> edit one workorder item
putRoute.editById(
	router,
	getWorkordersItemsDetailsDB,
	postWorkordersItemsDetailsDB,
	today_now,
	'workorder_item_detail_id'
);

router.put('/:id/actual_heat', async (req, res) => {
	const { id } = req.params;
	const body = req.body;

	const editedEntryId = await knex(postWorkordersItemsDetailsDB)
		.update(body)
		.where({ workorder_item_detail_id: id })
		.returning('workorder_item_detail_id');

	res.json(editedEntryId);
});

// Special Route Function => MTR Heat Verification
const putRoute_editPipeHeat = (router, url_info, heat_name, heat_name_unique) => {
	// Vary API URL based on
	//	1. splice_heat
	//	2. pipe_heat
	router.put(`/:id/${url_info}`, async (req, res) => {
		const { id } = req.params;
		const { values, user_id } = req.body;
		const new_heat = { [`${heat_name}`]: null, [`${heat_name_unique}`]: null };
		let heat_in_db_yn = [{ heat_in_db: false }];

		// heat is null (' ')
		if (values.heat == null) {
			// set heat and unique heat to null
			await knex(postWorkordersItemsDetailsDB)
				.update(new_heat)
				.where('workorder_item_detail_id', '=', id);
		}
		// heat is not null
		else {
			const heat = values.heat.toUpperCase();

			// look for heat - material_tracking_details db
			const database_heat = await knex(getMaterialTrackingDetails).where(`heat`, '=', heat);

			// found heat - material_tracking_details db
			if (database_heat.length > 0) {
				new_heat[`${heat_name}`] = database_heat[0].id;
				await knex(postWorkordersItemsDetailsDB)
					.update(new_heat)
					.where('workorder_item_detail_id', '=', id);

				heat_in_db_yn[0].heat_in_db = true;
			}
			// NOT found heat - material_tracking_details db => unique splice heat
			else {
				new_heat[`${heat_name_unique}`] = heat;
				await knex(postWorkordersItemsDetailsDB)
					.update(new_heat)
					.where('workorder_item_detail_id', '=', id);
			}
		}
		res.json(heat_in_db_yn);
	});
};

//PIPE HEAT
// /workorders/:id/workorder_items/:id/workorders_items_details/:id/pipe_heat -> PUT -> edit one workorder item PIPE HEAT
putRoute_editPipeHeat(router, 'pipe_heat', 'pipe_pipe_heat', 'pipe_pipe_heat_unique');

// SPLICE HEAT
// /workorders/:id/workorder_items/:id/workorders_items_details/:id/splice_heat -> PUT -> edit one workorder item
putRoute_editPipeHeat(router, 'splice_heat', 'pipe_splice_heat', 'pipe_splice_heat_unique');

router.put(`/:id/plate_heat`, async (req, res) => {
	const { id } = req.params;
	const { values, user_id } = req.body;
	console.log(req.body);

	const heatFromValues = (obj) => {
		let heat;
		if (obj.helix_1_heat) heat = obj.helix_1_heat;
		if (obj.helix_2_heat) heat = obj.helix_2_heat;
		if (obj.helix_3_heat) heat = obj.helix_3_heat;
		if (obj.helix_4_heat) heat = obj.helix_4_heat;
		return heat ? heat.toUpperCase() : heat;
	};

	const helixName = (obj) => {
		let heat;
		if (obj.hasOwnProperty('helix_1_heat')) heat = 'helix_1_heat';
		if (obj.hasOwnProperty('helix_2_heat')) heat = 'helix_2_heat';
		if (obj.hasOwnProperty('helix_3_heat')) heat = 'helix_3_heat ';
		if (obj.hasOwnProperty('helix_4_heat')) heat = 'helix_4_heat ';
		return heat;
	};

	if (!heatFromValues(values)) {
		await knex(postWorkordersItemsDetailsDB)
			.update({ [helixName(values)]: null })
			.where('workorder_item_detail_id', '=', values.workorder_item_detail_id);
	} else {
		const database_heat = await knex(getMaterialTrackingDetails).where(
			`heat`,
			'=',
			heatFromValues(values)
		);
		console.log('database_heat', database_heat);
		// // found heat - material_tracking_details db
		if (database_heat.length > 0) {
			// new_heat[`${heat_name}`] = database_heat[0].id;
			await knex(postWorkordersItemsDetailsDB)
				.update({ [helixName(values)]: database_heat[0].id })
				.where('workorder_item_detail_id', '=', id);
		} else {
			console.log('not here');

			const postNewHeat = await knex(database.postMaterialTrackingDetails)
				.insert({
					heat: heatFromValues(values),
					mtr_id: 3025,
					plate: values.plateId,
					pipe: 0,
					created_on: new Date(),
					created_by: user_id,
				})
				.returning('id');
			await knex(postWorkordersItemsDetailsDB)
				.update({ [helixName(values)]: postNewHeat[0] })
				.where('workorder_item_detail_id', '=', id);
		}
	}

	res.json('heat_in_db_yn');
});

// /workorders/:id/workorder_items/:id/workorders_items_details?type=XXX/:id -> DELETE -> remove information
router.delete(`/:id`, async (req, res) => {
	const { type } = req.query;

	if (type === 'pipe_form') {
		removed_info = await knex(postWorkordersItemsDetailsDB)
			.update(new_heat)
			.where('workorder_item_detail_id', '=', id);
		// Remove First Off Form Information - Stage => Welding
		// Remove QC Form Information - Stage => Welding
	} else if (type === 'qc_form') {
		await knex(postWorkordersItemsDetailsDB)
			.update(new_heat)
			.where('workorder_item_detail_id', '=', id);
		// Remove First Off Form Information - Stage => QC
		// Remove QC Form Information - Stage => QC
	}

	res.json(heat_in_db_yn);
});

module.exports = router;
