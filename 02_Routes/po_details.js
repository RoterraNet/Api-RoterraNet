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
		.orderBy('po_detail_id', 'desc');

	res.json(getEntry);
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
