const express = require('express');
const router = express.Router({ mergeParams: true });
const knex = require('../01_Database/connection');

const database = require('../01_Database/database');
const getGeneralLedgerDetailsDB = database.getGeneralLedgerDetailsDB;

// /general ledger -> GET ALL
router.get('/', async (req, res) => {
	const { id } = req.params;
	let getEntries;

	console.log(id);
	if (id === 0) {
		getEntries = await knex(getGeneralLedgerDetailsDB)
			.select(
				knex.raw("concat(gl_detail_code, ' - ' , gl_detail_description) as gl_detail_name"),
				'gl_detail_id'
			)
			.where('gl_id', '=', id)
			.andWhere({ deleted: false })
			.orderBy('gl_detail_order', 'asc');
	} else {
		getEntries = await knex(getGeneralLedgerDetailsDB)
			.select(
				knex.raw("concat(gl_detail_code, ' - ' , gl_detail_description) as gl_detail_name"),
				'gl_detail_id',
				'gl_id'
			)
			.where({ deleted: false })
			.orderBy('gl_id', 'asc');
	}
	res.json(getEntries);
});

module.exports = router;
