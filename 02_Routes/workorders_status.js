const express = require('express');
const router = express.Router({ mergeParams: true });
const knex = require('../01_Database/connection');

const database = require('../01_Database/database');
const getWorkordersStatusDB = database.getWorkordersStatusDB;

// /workorders_status -> GET ALL
router.get('/', async (req, res) => {
	const getEntries = await knex(getWorkordersStatusDB).select('*').orderBy('status_order', 'asc');

	res.json(getEntries);
});

module.exports = router;
