const express = require('express');
const router = express.Router({ mergeParams: true });
const knex = require('../01_Database/connection');
const datefns = require('date-fns');
const database = require('../01_Database/database');

const deleteRoute = require('./RouteCreaters/delete');
const postFunctionRoute = require('./RouteCreaters/post_function');
const getRoute = require('./RouteCreaters/get');
const getTableRoute = require('./RouteCreaters/getTable');
const putFunctionRoute = require('./RouteCreaters/put_function');

const getPoDetailDB = database.getPoDetailDB;
const postPoDetailDB = database.postPoDetailDB;

const quote_mail = require('../04_Emails/quotes_emails/quote_addEdit_email/quote_addEdit_fn');
const edit_quote_mail = quote_mail.edit_quote_mail;

const complicated_functions = require('../02.1_Complicated_Route_Functions/quotes_add_fn');
const { po_approval_process } = require('./po/poFunctions');
const quotes_add_fn = complicated_functions.quotes_add_fn;

const today_now = datefns.format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

// JOINED ROUTES   ///////////////////////////////////////////////////////////////////////////////////////////////
// PO DETAILS
router.use('/:id/po_received', require('./po_received'));

// /po/:id/po_details => Get All
router.get('/', async (req, res) => {
	const { id } = req.params;
	const getEntry = await knex(getPoDetailDB)
		.select('*')
		.where(`po_id`, '=', id)
		.andWhere({ deleted: false })
		.orderBy('po_detail_id', 'desc');

	res.json(getEntry);
});

router.post('/updatePoDetail', async (req, res) => {
	const { po_id, created_on, created_by, po_details, edit_reason_comment } = req.body;
	const poInfo = await knex(database.getPoDB)
		.select(
			'po_id',
			'company',
			'supplier',
			'job_number',
			'unit_number',
			'requisitioned_by',
			'requisitioned_for',
			'status'
		)
		.where({ po_id: po_id })
		.andWhere({ deleted: 0 });

	const newEditedPoId = await knex(database.postPoEditedDB)
		.insert({
			po_id: po_id,
			...poInfo[0],
			deleted: 0,
			edit_reason_comment: edit_reason_comment,
			created_on: created_on,
			created_by: created_by,
			updated_on: created_on,
			updated_by: created_by,
		})
		.returning('po_edited_id');

	const previousPoDetail = await knex(getPoDetailDB)
		.select(
			'po_detail_id',
			'quantity',
			'description',
			'part_number',
			'unit_price',
			'extended_cost',
			'expected_date',
			'gl_id',
			'gl_detail_id'
		)
		.where({ po_id: po_id })
		.andWhere({ deleted: false });

	const fieldsToInsert = previousPoDetail.map((field) => ({
		po_edited_id: newEditedPoId[0],
		po_id: po_id,
		...field,
	}));
	const newEditedPoDetailId = await knex(database.postPoDetailEditedDB).insert(fieldsToInsert);
	const deletePreviousPoDetail = await knex(postPoDetailDB)
		.update({ deleted: true })
		.where({ po_id: po_id })
		.andWhere({ deleted: false });
	const newItems = po_details.map((field) => ({
		po_id: po_id,
		quantity: field.quantity,
		description: field.description,
		part_number: field.part_number,
		gl_id: field.gl_id,
		gl_detail_id: field.gl_detail_id,
		expected_date: field.expected_date,
		unit_price: field.unit_price,
		extended_cost: field.extended_cost,
	}));

	const addNewItemsToPoDetail = await knex(database.postPoDetailDB).insert(newItems);

	// const po_message = await po_approval_process(created_by, po_id);

	res.json({ po_id: po_id, po_message: po_message });
});

// po -> PATCH -> TABLE -> get all quotes paginated
getTableRoute.getTableData(router, getPoDetailDB);

// po -> POST -> create new quote
// SENDS EMAIL!!!
postFunctionRoute.newEntry_function(
	router,
	getPoDetailDB,
	postPoDetailDB,
	today_now,
	'id',
	quotes_add_fn
);

// po/:id -> GET -> get one quote
getRoute.getById(router, getPoDetailDB, 'po_detail_id');

// po/:id -> PUT -> edit one quote
// SENDS EMAIL!!!
putFunctionRoute.editById_mail(
	router,
	getPoDetailDB,
	postPoDetailDB,
	today_now,
	'id',
	edit_quote_mail
);

// po/:id -> DELETE -> delete one quote
deleteRoute.deleteRoute(router, postPoDetailDB, today_now, 'id');

module.exports = router;
