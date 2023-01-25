const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');

const database = require('../01_Database/database');
const getPositionsDB = database.getPositionsDB;

// /positions -> GET ALL
router.get('/', async (req, res) => {
	const getEntries = await knex(getPositionsDB).select('*').orderBy('position_name', 'asc');

	res.json(getEntries);
});

module.exports = router;
