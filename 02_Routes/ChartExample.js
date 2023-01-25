const { sub } = require('date-fns');
const express = require('express');
const { groupBy } = require('lodash');
const router = express.Router();
const knex = require('../01_Database/connection');

const database = require('../01_Database/database');

const getQuotesDB = database.getQuotesDB;

const sixMonthsAgo = sub(new Date(), { months: 6 });

// /calendarevent/current' -> GET
/* GETS ALL IN and OUT Data ---
that has a RETURN_DATE that has NOT been past todays date
and a DATE (leaving date) that has yet to come */
router.get('/', async (req, res) => {
	const rawData = knex.raw('created_on, COUNT(created_on)');
	const getInAndOut = await knex(getQuotesDB)
		.select(rawData)
		.where('created_on', '>=', sixMonthsAgo)
		.groupBy('created_on')
		.orderBy('created_on', 'desc');

	res.json(getInAndOut);
});
module.exports = router;
