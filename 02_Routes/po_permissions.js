const express = require('express');
const router = express.Router();

const database = require('../01_Database/database');
const knex = require('../01_Database/connection');

const getUsersPermissionsDB = database.getUsersPermissionsDB;

// all po permissions
// self_approval > 0  && other_approval > 0
router.get('/', async (req, res) => {
	getEntries = await knex(getUsersPermissionsDB)
		.select('user_id', 'first_name', 'last_name', 'po_limit_self', 'po_limit_other')
		.where('po_limit_self', '>', 1)
		.andWhere('po_limit_other', '>=', 0)
		.andWhere('deleted', '=', 0)
		.orderBy('po_limit_self', 'desc');

	res.json(getEntries);
});

module.exports = router;
