const express = require('express');
const router = express.Router({ mergeParams: true });
const knex = require('../01_Database/connection');

const database = require('../01_Database/database');
const getSuppliersStatusDB = database.getSuppliersStatusDB;

// /suppliers_status -> GET ALL
router.get('/', async (req, res) => {
	const getEntries = await knex(getSuppliersStatusDB).select('*').whereIn('id', [2, 3]).orderBy('status_order', 'asc');

	res.json(getEntries);
});

module.exports = router;
