const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');

const database = require('../01_Database/database');
const getSearchDB = database.getSearchDB;

router.get('/', async (req, res) => {
	const { search, type } = req.query;

	const global_search_results = await knex.select('*').where('search_text', 'ilike', `%${search}%`).from(getSearchDB).limit(10);

	res.json(global_search_results);
});

module.exports = router;
