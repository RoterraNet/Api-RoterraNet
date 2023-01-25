const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');

const database = require('../01_Database/database');
const getGeneralLedgerDB = database.getGeneralLedgerDB;

// JOINED ROUTES   ///////////////////////////////////////////////////////////////////////////////////////////////
// GENERAL LEDGER DETAILS
router.use('/:id/general_ledger_details', require('./general_ledger_details'));

// /general ledger -> GET ALL
router.get('/', async (req, res) => {
	const getEntries = await knex(getGeneralLedgerDB)
		.select('gl_description as gl_name', 'gl_id')
		.where({ deleted: false })
		.orderBy('gl_order', 'asc');

	res.json(getEntries);
});

module.exports = router;
