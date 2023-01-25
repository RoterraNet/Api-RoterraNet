const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');

const database = require('../01_Database/database');
const getDepartmentsDB = database.getDepartmentsDB;

// /Departments -> GET ALL
router.get('/', async (req, res) => {
	const getEntries = await knex(getDepartmentsDB).select('*').orderBy('department_name', 'asc');

	res.json(getEntries);
});

module.exports = router;
