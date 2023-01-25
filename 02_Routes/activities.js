const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');

const deleteRoute = require('./RouteCreaters/delete');
const postRoute = require('./RouteCreaters/post');
const getRoute = require('./RouteCreaters/get');
const getTableRoute = require('./RouteCreaters/getTable');
const putRoute = require('./RouteCreaters/put');

const database = require('../01_Database/database');
const postActivitiesDB = database.postActivitiesDB;
const getActivitiesDB = database.getActivitiesDB;

const datefns = require('date-fns');
const today_now = datefns.format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

// /activity -> GET -> LIST
router.get('/', async (req, res) => {
	const { customer, quote, contact } = req.query;
	const sql = knex(getActivitiesDB).select('*').where('deleted', '=', false);
	let getEntries;

	// ?query_key=query_value
	// eg. ?customer=customer_id
	// Get activity for customer X
	if (contact) {
		getEntries = await sql.andWhere('contact_id', '=', contact);
	}
	if (customer) {
		getEntries = await sql.andWhere('customer_id', '=', customer);
	}
	if (quote) {
		getEntries = await sql.andWhere('quote_id', '=', quote);
	}

	res.json(getEntries);
});

// /activity -> PATCH -> TABLE -> get all activity paginated
getTableRoute.getTableData(router, getActivitiesDB);

// /activity -> POST -> create new activity
postRoute.newEntry(router, getActivitiesDB, postActivitiesDB, today_now, 'activity_id');

// /activity/:id -> GET -> get one activity
getRoute.getById(router, getActivitiesDB, 'activity_id');

// /activity/:id -> PUT -> edit one activity
putRoute.editById(router, getActivitiesDB, postActivitiesDB, today_now, 'activity_id');

// /activity/:id -> DELETE -> delete one activity
deleteRoute.deleteRoute(router, postActivitiesDB, today_now, 'activity_id');

module.exports = router;
