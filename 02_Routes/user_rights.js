const express = require('express');
const router = express.Router({ mergeParams: true });
const knex = require('../01_Database/connection');

const database = require('../01_Database/database');
const getUserRightsDB = database.getUserRightsDB;

// /po_status -> GET ALL
router.get('/', async (req, res) => {
	const { type } = req.query;
	let getEntries;
	if (type === 'all') {
		getEntries = await knex(getUserRightsDB).select('*').where('user_rights_id', '>=', 2).orderBy('user_rights_id', 'asc');
	}
	if (type === 'admin') {
		getEntries = await knex(getUserRightsDB).select('*').orderBy('user_rights_id', 'ac');
	}

	res.json(getEntries);
});

module.exports = router;
