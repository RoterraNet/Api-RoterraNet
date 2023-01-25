const express = require('express');
const router = express.Router({ mergeParams: true });
const knex = require('../01_Database/connection');

const database = require('../01_Database/database');
const getEquipmentTypesDB = database.getEquipmentTypesDB;
const postEquipmentTypesDB = database.postEquipmentTypesDB;

// /equpiment_types -> GET ALL
router.get('/', async (req, res) => {
	const getEntries = await knex(getEquipmentTypesDB).select('*').orderBy('equipment_type_name', 'asc');

	res.json(getEntries);
});

module.exports = router;
