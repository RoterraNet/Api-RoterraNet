const express = require('express');
const router = express.Router({ mergeParams: true });

const knex = require('../01_Database/connection');
const database = require('../01_Database/database');
const getTableRoute = require('./RouteCreaters/getTable');

const getQuotesDB = database.getQuotesDB;

const getQuotesCustomersDB = database.getQuotesCustomersDB;
const postQuotesCustomersDB = database.postQuotesCustomersDB;

const deleteRoute = require('./RouteCreaters/delete');
const postRoute = require('./RouteCreaters/post');
const putRoute = require('./RouteCreaters/put');
const datefns = require('date-fns');

const today_now = datefns.format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

// /quotes/:id/quotes_customer => Get All
router.get('/', async (req, res) => {
	const { id } = req.params;

	const getEntry = await knex(getQuotesDB)
		.select(`${getQuotesCustomersDB}.*`)
		.where(`${getQuotesDB}.quote_id`, '=', id)
		.leftJoin(
			getQuotesCustomersDB,
			`${getQuotesDB}.quote_id`,
			'=',
			`${getQuotesCustomersDB}.quote_id`
		)
		.orderBy('customer_name', 'asc');

	res.json(getEntry);
});

getTableRoute.getTableData(router, getQuotesCustomersDB);

// /quotes/:id/quotes_customer?type=XXXXX => Edit All
router.put('/', async (req, res) => {
	const { type } = req.query;
	const { id } = req.params;
	const { values, user_id } = req.body;
	if (type === 'lost') {
		// LOST => Set All
		await knex(postQuotesCustomersDB)
			.update({ status: 2, updated_by_id: user_id, updated_on: today_now })
			.where('quote_id', '=', id);
	}
	if (type === 'won') {
		// LOST => Set All
		await knex(postQuotesCustomersDB)
			.update({ status: 2, updated_by_id: user_id, updated_on: today_now })
			.where('quote_id', '=', id);

		// WON => Set One Customer
		await knex(postQuotesCustomersDB)
			.update({ status: 1, updated_by_id: user_id, updated_on: today_now })
			.where('quote_id', '=', id)
			.andWhere('customer_id', '=', values.customer_id);
	}

	res.json({ completed: true });
});

// /quotes/:id/quotes_customer => Add
postRoute.newEntry(
	router,
	getQuotesCustomersDB,
	postQuotesCustomersDB,
	today_now,
	'quote_customer_id'
);

// /quotes/:id/quotes_customer/:id2 => Edit
putRoute.editById(
	router,
	getQuotesCustomersDB,
	postQuotesCustomersDB,
	today_now,
	'quote_customer_id'
);

// /quotes/:id/quotes_customer/:id2 => Delete
deleteRoute.deleteRoute(router, postQuotesCustomersDB, today_now, 'quote_customer_id');

module.exports = router;
