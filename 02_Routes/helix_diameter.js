const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');

const database = require('../01_Database/database');
const getHelixDiameterDB = database.getHelixDiameterDB;

// /helix_diameter -> GET
router.get('/', async (req, res) => {
	const { type } = req.query;
	let getEntries;

	getEntries = await knex(getHelixDiameterDB).select('id', 'helix_text').orderBy('id', 'asc');

	res.json(getEntries);
});

module.exports = router;
