const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');

const deleteRoute = require('./RouteCreaters/delete');
const postRoute = require('./RouteCreaters/post');
const getRoute = require('./RouteCreaters/get');
const getTableRoute = require('./RouteCreaters/getTable');
const putRoute = require('./RouteCreaters/put');

const database = require('../01_Database/database');
const postContactDB = database.postContactDB;
const getContactDB = database.getContactDB;
const getCustomerDB = database.getCustomerDB;
const getProjectsDB = database.getProjectsDB;
const getQuotesDB = database.getQuotesDB;

const datefns = require('date-fns');
const today_now = datefns.format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

// /contacts -> GET
router.get('/', async (req, res) => {
	try {
		const { customer } = req.query;
		const sql = knex(getContactDB).select('contact_id', 'full_name').where('deleted', '=', 0);
		let getEntries;

		// ?customer=customer_id -> Get Contacts who work for Customer X
		if (customer) {
			getEntries = await sql.andWhere('customer', '=', customer);
		}

		res.json(getEntries);
	} catch (e) {
		console.log(e);

		res.json({ msg: 'unable to pull customer contacts', error: e });
	}
});

// /contacts -> PATCH -> TABLE -> get all contacts paginated
getTableRoute.getTableData(router, getContactDB);

// /contacts -> POST -> create new contact
postRoute.newEntry(router, getContactDB, postContactDB, today_now, 'contact_id');

// /contacts/:id -> GET -> get one contact
getRoute.getById(router, getContactDB, 'contact_id');

// /contacts/:id -> PUT -> edit one contact
putRoute.editById(router, getContactDB, postContactDB, today_now, 'contact_id');

// /contacts/:id -> DELETE -> delete one contact
deleteRoute.deleteRoute(router, postContactDB, today_now, 'contact_id');

// contacts/:id/project -> PATCH -> TABLE -> get projects by that contact paginated
getTableRoute.getTableData_ById(
	router,
	'project',
	getContactDB,
	'contact_id',
	getProjectsDB,
	'contact'
);

// contacts/:id/quotes  -> PATCH -> TABLE -> get quotes by that contact paginated
getTableRoute.getTableData_ById(
	router,
	'quotes',
	getContactDB,
	'contact_id',
	getQuotesDB,
	'contact_id'
);

module.exports = router;
