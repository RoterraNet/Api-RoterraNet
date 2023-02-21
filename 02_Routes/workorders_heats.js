const express = require('express');
const router = express.Router({ mergeParams: true });
const knex = require('../01_Database/connection');

const database = require('../01_Database/database');

const getWorkordersHeatsDB = database.getWorkordersHeatsDB;
const getPlasmaRunSheetItemsDB = database.getPlasmaRunSheetItemsDB;

const subMonths = require('date-fns/subMonths');
const format = require('date-fns/format');

const sixMonthAgo = format(subMonths(new Date(), 24), 'yyyy-MM-dd');

// /workorders/:id/heats -> GET ALL Heat for that Workorder
router.get('/:id/heats', async (req, res) => {
	const { id } = req.params;
	const { type, plateId } = req.query;

	const convertStringToNum = [];

	if (plateId)
		plateId.map((each) => {
			convertStringToNum.push(parseInt(each));
		});

	const getAllEntry = await knex(getWorkordersHeatsDB)
		.select('heat')
		.modify((builder) => {
			if (type == 'plate') {
				builder.whereIn('plate', convertStringToNum);
			} else {
				builder.where({ pipe: id });
			}
		})
		.andWhereBetween('created_on', [sixMonthAgo, format(new Date(), 'yyyy-MM-dd')])
		.orderBy('id', 'desc');

	res.json(getAllEntry);
});

router.get('/:id/plateheats', async (req, res) => {
	const { id } = req.params;

	const getAllEntry = await knex(getPlasmaRunSheetItemsDB)
		.select('heat_number', 'heat_id')
		.where({ workorder_id: id });

	res.json(getAllEntry);
});

router.get('/allheats', async (req, res) => {
	const { id } = req.params;
	const getAllEntry = await knex(getWorkordersHeatsDB)
		.select('heat')
		.orderBy('heat', 'desc')
		.distinctOn('heat');

	res.json(getAllEntry);
});

router.get('/usedByWorkorder/:id', async (req, res) => {
	const { id } = req.params;

	const getAllHeatForWorkorder = await knex(database.getWorkordersItemsDetailsDB)
		.select('pipe_pipe_heat', 'mtr_detail_id', 'mtr_id')
		.where({ workorder_id: id })

		.distinctOn('pipe_pipe_heat');

	res.json(getAllHeatForWorkorder);
});

module.exports = router;
