const express = require('express');
const Knex = require('knex');
const { select } = require('../01_Database/connection');
const router = express.Router();
const knex = require('../01_Database/connection');

const database = require('../01_Database/database');
const postOrderControlDB = database.postOrderControlDB;
const getOrderControlDB = database.getOrderControlDB;

const postProjectsDB = database.postProjectsDB;
const getProjectsDB = database.getProjectsDB;

// /notes -> GET -> LIST
router.get('/:project_id', async (req, res) => {
	const { project_id } = req.params;
	const sql = await knex(getOrderControlDB)
		.select('oc_name', 'contracttotal', 'updated_by_fullname', 'changeordernumber', 'reason')
		.where('project_id', '=', project_id)
		.orderBy('changeordernumber', 'desc')
		.returning('*');

	res.status(202).send(sql);
});

router.post('/', async (req, res) => {
	const { contracttotal, project_id, reason, updated_by, updated_on } = req.body.values;
	try {
		const getValue = await knex(getProjectsDB)
			.select('contract_total', 'updated_by', 'updated_on', 'created_on', 'created_by')
			.where({ project_id: project_id });

		const getCount = await knex(getOrderControlDB)
			.count('project_id')
			.where({ project_id: project_id });

		const {
			contract_total,
			updated_by: oldUpdated_by,
			created_by,
			updated_on: oldUpdated_on,
			created_on,
		} = getValue[0];

		const { count } = getCount[0];

		await knex(postOrderControlDB).insert({
			project_id: 2788,
			contracttotal: contract_total,
			changeordernumber: count,
			updated_by_id: oldUpdated_by ? oldUpdated_by : created_by,
			updated_on: oldUpdated_on ? oldUpdated_on : created_on,
			oc_name: updated_by ? 'Change Order' : 'Original',
			reason: reason,
		});

		const updateValue = await knex(postProjectsDB)
			.where({ project_id: 2788 })
			.update({
				contract_total: contracttotal,
				updated_by: updated_by,
				updated_on: updated_on,
			})
			.returning('*');

		res.status(200).json({ msg: 'The Contract Value was changed. ' });
	} catch {
		res.status(500).json({ error: ' Something Went Wrong. Try again later.' });
	}
});

module.exports = router;
