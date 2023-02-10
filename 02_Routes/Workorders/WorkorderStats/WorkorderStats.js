const express = require('express');
const router = express.Router();
const database = require('../../../01_Database/database');
const knex = require('../../../01_Database/connection');
const { format } = require('date-fns');

const getWorkordersItemsDetailsDB = database.getWorkordersItemsDetailsDB;

router.get('/stats/', async (req, res) => {
	const { id } = req.params;
	const raw = knex.raw('DISTINCT pipe_approved_on::date');

	const allDates = await knex(getWorkordersItemsDetailsDB)
		.select(raw)
		.whereBetween('pipe_approved_on', ['2023-01-15', '2023-02-20']);

	const allWorkorders = await knex(getWorkordersItemsDetailsDB)
		.select('workorder_item_detail_name', 'pipe_approved_on')
		.whereBetween('pipe_approved_on', ['2023-01-15', '2023-02-20']);

	allDates.map((date) => {
		date.workorders = [];

		allWorkorders.map((workorderItems) => {
			format(new Date(workorderItems.pipe_approved_on), 'LLL-dd-yyyy') ===
				format(new Date(date.pipe_approved_on), 'LLL-dd-yyyy') &&
				date.workorders.push(workorderItems);
		});
	});

	res.json(allDates);
});

module.exports = router;
