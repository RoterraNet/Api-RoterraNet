const express = require('express');
const router = express.Router({ mergeParams: true });
const knex = require('../01_Database/connection');

const database = require('../01_Database/database');
const getPoStatusDB = database.getPoStatusDB;

// /po_status -> GET ALL
router.get('/', async (req, res) => {
	const { type } = req.query;
	let getEntries;
	if (type == 'approval') {
		getEntries = await knex(getPoStatusDB).select('*').orderBy('id', 'asc').whereIn('status_name', ['2. Approved', '0. Rejected']);
	} else {
		getEntries = await knex(getPoStatusDB).select('*').orderBy('id', 'asc');
	}

	res.json(getEntries);
});

module.exports = router;
