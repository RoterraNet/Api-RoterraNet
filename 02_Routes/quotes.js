const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');
const datefns = require('date-fns');
const database = require('../01_Database/database');

const deleteRoute = require('./RouteCreaters/delete');
const postFunctionRoute = require('./RouteCreaters/post_function');
const getRoute = require('./RouteCreaters/get');
const getTableRoute = require('./RouteCreaters/getTable');
const putFunctionRoute = require('./RouteCreaters/put_function');

const getQuotesDB = database.getQuotesDB;
const postQuotesDB = database.postQuotesDB;
const getQuotesCustomersDB = database.getQuotesCustomersDB;

const quote_mail = require('../04_Emails/quotes_emails/quote_addEdit_email/quote_addEdit_fn');
const edit_quote_mail = quote_mail.edit_quote_mail;

const complicated_functions = require('../02.1_Complicated_Route_Functions/quotes_add_fn');
const quotes_add_fn = complicated_functions.quotes_add_fn;

const today_now = datefns.format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

// JOINED ROUTES   ///////////////////////////////////////////////////////////////////////////////////////////////
// QUOTE CUSTOMERS
router.use('/:id/quotes_customers', require('./quotes_customers'));
// QUOTE NOTES
router.use('/:id/quotes_notes', require('./quotes_notes'));

// quotes -> PATCH -> TABLE -> get all quotes paginated
getTableRoute.getTableData(router, getQuotesDB);

// // quotes -> POST -> create new quote
// // SENDS EMAIL!!!
// postFunctionRoute.newEntry_function(
// 	router,
// 	getQuotesDB,
// 	postQuotesDB,
// 	today_now,
// 	'quote_id',
// 	quotes_add_fn
// );

/**
 * Function Posts new Quotes to the DB
 * @author   Hasan Alghanim
 * @param    {Number} values   			Gets values from params
 * @description 						Inserts values into DB, Sends email about quotes
 * @route  								POST -> '/'
 * @return   {Object} 					Returns All data of new Quote
 */
router.post('/', async (req, res) => {
	const { values, user_id } = req.body;
	console.log(values);
	try {
		result = await knex(postQuotesDB)
			.insert({
				...values,
			})
			.returning('quote_id');

		const getNewEntry = await knex(getQuotesDB).select('*').where({ quote_id: result[0] });
		await quotes_add_fn(getNewEntry[0], user_id);

		res.statusCode = 202;
		res.json(result[0]);
	} catch (e) {
		console.log(e);
		return res.status(400).send({
			message: 'This is an error!',
			error: e,
		});
	}
});
// quotes/:id -> GET -> get one quote
getRoute.getById(router, getQuotesDB, 'quote_id');

// quotes/:id -> PUT -> edit one quote
// SENDS EMAIL!!!
putFunctionRoute.editById_mail(
	router,
	getQuotesDB,
	postQuotesDB,
	today_now,
	'quote_id',
	edit_quote_mail
);

router.put('/:id/quote_costing', async (req, res) => {
	const { id } = req.params;
	const { values, user_id } = req.body;

	try {
		// Collect Old Data Prior to Overwriting it
		const getOldEntry = await knex(getQuotesDB).select('*').where({ quote_id: id });

		// Enter New SQL Data
		const editedEntryId = await knex(postQuotesDB)
			.update(values)
			.where({ quote_id: id })
			.returning('quote_id');

		res.status(200).json({
			accepted: true,
			quote_id: editedEntryId[0],
			message: 'Costing was updated',
		});
		const getNewEntry = await knex(getQuotesDB).select('*').where({ quote_id: id });

		// Send Mail / Execute Function / Create File with New Data -> Comparing Old SQL and New SQL
		edit_quote_mail(getOldEntry[0], getNewEntry[0], user_id);
	} catch (error) {
		console.log(error);
		res.status(500).json({
			accepted: false,
			error: error,
			message: 'Something went Wrong',
		});
	}
});

// quotes/:id -> DELETE -> delete one quote
deleteRoute.deleteRoute(router, postQuotesDB, today_now, 'quote_id');

// quotes/:id  -> GET -> LIST
router.patch('/:id/quotes_customers', async (req, res) => {
	const { id } = req.params;
	const sql = await knex(getQuotesCustomersDB).where('quote_customer_id', '=', id);
	res.json(sql);
});

router.get('/active/EngEst', async (req, res) => {
	const ActiveEst = await knex(getQuotesDB)
		.select('assigned_to_name')
		.where({ assigned_to_user_status: 0 })
		.distinctOn('assigned_to_name');

	const ActiveEng = await knex(getQuotesDB)
		.select('eng_contact_name')
		.where({ eng_user_status: 0 })
		.distinctOn('eng_contact_name');

	const estimators = [];
	const engineers = [];

	ActiveEst.map((each) => {
		each.assigned_to_name !== null &&
			estimators.push({ label: each.assigned_to_name, value: each.assigned_to_name });
	});

	ActiveEng.map((each) => {
		each.eng_contact_name !== null &&
			engineers.push({ label: each.eng_contact_name, value: each.eng_contact_name });
	});

	res.send({ estimators, engineers });
});

// router.post('/test', async (req, res) => {
// 	const sql = await knex(getQuotesDB)
// 		.select(
// 			'quote_id',
// 			'due_date',
// 			'customer_name',
// 			'contact_id',
// 			'contact_name',
// 			'project_identifier',
// 			'status',
// 			'comment',
// 			'assigned_to_id',
// 			'created_by_id',
// 			'created_on',
// 			'est_helical_count',
// 			'est_total_value',
// 			'quote_status_color',
// 			'quote_status_description',
// 			'eng_completed_on',
// 			'eng_comment'
// 		)
// 		.where('deleted', '=', '0')
// 		.limit(1000);
// 	// .toString();
// 	res.json(sql);
// });

module.exports = router;
