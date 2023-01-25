const express = require('express');
const router = express.Router();
const datefns = require('date-fns');
const database = require('../01_Database/database');
const knex = require('../01_Database/connection');

const deleteRoute = require('./RouteCreaters/delete');
const postRoute = require('./RouteCreaters/post');
const getRoute = require('./RouteCreaters/get');
const getTableRoute = require('./RouteCreaters/getTable');
const putRoute = require('./RouteCreaters/put');

const postCustomerDB = database.postCustomerDB;
const getCustomerDB = database.getCustomerDB;
const getProjectsDB = database.getProjectsDB;
const getQuotesDB = database.getQuotesDB;
const getContactDB = database.getContactDB;
const getQuotesCustomersDB = database.getQuotesCustomersDB;

const today_now = datefns.format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

//customer -> GET LIST
router.get('/', async (req, res) => {
	const { type } = req.query;
	let getEntry;

	//customer -> GET -> get all active customers
	if (type == 'active') {
		getEntry = await knex(getCustomerDB)
			.select('name', 'customer_id')
			.where('deleted', '=', 0)
			.orderBy('name', 'asc');
	}

	res.json(getEntry);
});

// /customer -> PATCH -> TABLE -> get all customers paginated
getTableRoute.getTableData(router, getCustomerDB);

// /customer -> POST -> create customer
postRoute.newEntry(router, getCustomerDB, postCustomerDB, today_now, 'customer_id');

// /customer/:id -> GET -> get one customer
getRoute.getById(router, getCustomerDB, 'customer_id');

// /customer/:id -> PUT -> edit one customer
putRoute.editById(router, getCustomerDB, postCustomerDB, today_now, 'customer_id');

// /customer/:id -> DELETE -> delete one customer
deleteRoute.deleteRoute(router, postCustomerDB, today_now, 'customer_id');

// /customer/:id/project -> PATCH -> TABLE -> get projects by that customer paginated
getTableRoute.getTableData_ById(
	router,
	'project',
	getCustomerDB,
	'customer_id',
	getProjectsDB,
	'customer'
);

// /customer/:id/quotes  -> PATCH -> TABLE -> get quotes by that cutomer paginated
getTableRoute.getTableData_ById(
	router,
	'quotes',
	getCustomerDB,
	'customer_id',
	getQuotesDB,
	'customer_id'
);

// /customer/:id/quotes  -> PATCH -> TABLE ->get quotes by that customer paginated
getTableRoute.getTableData_ById(
	router,
	'contacts',
	getCustomerDB,
	'customer_id',
	getContactDB,
	'customer'
);

module.exports = router;
