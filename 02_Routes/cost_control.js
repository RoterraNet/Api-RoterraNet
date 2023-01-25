const express = require('express');
const router = express.Router();
const database = require('../01_Database/database');
const knex = require('../01_Database/connection');
const { select } = require('../01_Database/connection');

const getCostControlDB = database.getCostControlDB;
const postCostControlDB = database.postCostControlDB;

const getCostControlItemsDB = database.getCostControlItemsDB;
const postCostControlItemsDB = database.postCostControlItemsDB;
const getProjectsDB = database.getProjectsDB;
const postProjectsDB = database.postProjectsDB;

router.get('/:id', async (req, res) => {
	const { id } = req.params;
	const getCostControl = await knex(getCostControlDB)
		.where({ project_id: id })
		.orderBy('scheduled_values', 'asc')
		.orderBy('cost_control_id', 'asc');
	res.json(getCostControl);
});

router.post('/', async (req, res) => {
	const { project_id, created_by, created_on, projectValueRows } = req.body.values;

	const checkNaN = (num) => {
		if (Number.isNaN(num)) return null;
		return num;
	};
	try {
		const fieldsToInsert = projectValueRows.map((item) => ({
			description: item.description,
			uom: item.uom,
			unit_price: checkNaN(parseFloat(item.unit_price)),
			scheduled_quantity: checkNaN(parseInt(item.scheduled_quantity)),
			scheduled_values: checkNaN(parseFloat(item.scheduled_quantity * item.unit_price)),
			co_quantity: checkNaN(parseInt(item.co_quantity)),
			co_values: checkNaN(parseFloat(item.co_quantity * item.unit_price)),
			retention: checkNaN(parseFloat(item.retention)),
			created_by: created_by,
			created_on: created_on,
			project_id: project_id,
		}));

		const resCostControlItems = await knex(postCostControlDB)
			.insert(fieldsToInsert)
			.returning('*');

		res.status(200).json({ accepted: true, message: 'Project Costing was updated' });
	} catch (error) {
		console.log(error);
		res.status(500).json({
			accepted: false,
			message: 'Something went Wrong. Try again later.',
			error: error,
		});
	}
});

router.post('/addholdBack/', async (req, res) => {
	const { project_id, created_by, created_on, retention, description, holdback_paid } =
		req.body.values;

	try {
		const resCostControlItems = await knex(postCostControlDB)
			.insert({
				description: description,
				retention: parseFloat(retention),
				created_by: created_by,
				created_on: created_on,
				project_id: project_id,
				holdback_paid: holdback_paid,
			})
			.returning('*');

		res.status(200).json({ accepted: true, message: 'Project Costing was updated' });
	} catch (error) {
		console.log(error);
		res.status(500).json({
			accepted: false,
			message: 'Something went Wrong. Try again later.',
			error: error,
		});
	}
});

router.put('/payHoldBack/', async (req, res) => {
	const { cost_control_id } = req.body.values;

	try {
		const resCostControlItems = await knex(postCostControlDB)
			.update({
				holdback_paid: true,
			})
			.where({ cost_control_id: cost_control_id })
			.returning('*');

		res.status(200).json({ accepted: true, message: 'Project Costing was updated' });
	} catch (error) {
		console.log(error);
		res.status(500).json({
			accepted: false,
			message: 'Something went Wrong. Try again later.',
			error: error,
		});
	}
});

router.put('/', async (req, res) => {
	const { values } = req.body;

	const checkNaN = (num) => {
		if (Number.isNaN(num)) return null;
		return num;
	};
	try {
		const resCostControlItems = await knex(postCostControlDB)
			.update({
				description: values.description,
				uom: values.uom,
				unit_price: checkNaN(parseFloat(values.unit_price)),
				scheduled_quantity: checkNaN(parseInt(values.scheduled_quantity)),
				scheduled_values: checkNaN(
					parseFloat(values.scheduled_quantity * values.unit_price)
				),
				co_quantity: checkNaN(parseInt(values.co_quantity)),
				co_values: checkNaN(parseFloat(values.co_quantity * values.unit_price)),
				retention: checkNaN(parseFloat(values.retention)),
			})
			.where({ cost_control_id: values.cost_control_id })
			.returning('*');

		res.status(200).json({ accepted: true, message: 'Project Costing Item was updated' });
	} catch (error) {
		console.log(error);
		res.status(500).json({
			accepted: false,
			message: 'Something went Wrong. Try again later.',
			error: error,
		});
	}
});

// ///////////////////////
router.get('/:id/total', async (req, res) => {
	const { id } = req.params;

	const raw = knex.raw(`type, price, uom, sum(quantity) as totalQuantity`);

	const getCostControlItems = await knex(getCostControlItemsDB)
		.select(raw)
		.groupBy('type', 'price', 'uom')
		.where({ project_id: id })
		.orderBy('type');

	res.json(getCostControlItems);
});

router.get('/projectvalue/:id', async (req, res) => {
	const { id } = req.params;

	const getProjectValue = await knex(getProjectsDB).select('contract_total').where({ id: id });

	res.json(getProjectValue[0]);
});

router.put('/changeProjectValue', async (req, res) => {
	const { contract_total, project_id, updated_by, updated_on } = req.body.values;
	try {
		const updateValue = await knex(postProjectsDB)
			.where({ id: project_id })
			.update({
				contract_total: contract_total,
				updated_by: updated_by,
				updated_on: updated_on,
			})
			.returning('contract_total');
		res.status(200).json({ accepted: true, message: 'Contract Value was changed' });
	} catch (error) {
		console.log(error);
		res.status(500).json({
			accepted: false,
			message: 'Something went Wrong. Try again later.',
			error: error,
		});
	}
});

module.exports = router;
