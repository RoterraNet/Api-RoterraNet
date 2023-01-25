const express = require('express');
const router = express.Router();
const datefns = require('date-fns');
const database = require('../01_Database/database');
const knex = require('../01_Database/connection');

const postQuotesPermissionsDB = database.postQuotesPermissionsDB;
const getUsersPermissionsDB = database.getUsersPermissionsDB;

// all quote permissions
// self_approval > 0  && other_approval > 0
router.get('/', async (req, res) => {
	getEntries = await knex(getUsersPermissionsDB)
		.select('user_id', 'first_name', 'last_name', 'quote_limit_self', 'quote_limit_other')
		.where('quote_limit_self', '>', 1)
		.andWhere('quote_limit_other', '>', 1)
		.andWhere({ deleted: 0 })
		.orderBy('quote_limit_self', 'desc');

	res.json(getEntries);
});

module.exports = router;
