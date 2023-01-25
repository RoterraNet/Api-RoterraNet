const express = require('express');
const router = express.Router();
const database = require('../01_Database/database');
const knex = require('../01_Database/connection');

const getCostControlDB = database.getCostControlDB;
const postCostControlDB = database.postCostControlDB;

const getCostControlInvoicingDB = database.getCostControlInvoicingDB;
const postCostControlInvoicingDB = database.postCostControlInvoicingDB;

const getCostControlInvoicingDetailDB = database.getCostControlInvoicingDetailDB;
const postCostControlInvoicingDetailDB = database.postCostControlInvoicingDetailDB;

router.get('/:id', async (req, res) => {
	const { id } = req.params;

	const getCostControlInvoice = await knex(getCostControlInvoicingDB).where({ project_id: id });

	const getCostControlInvoicingDetail = await knex(getCostControlInvoicingDetailDB).where({
		project_id: id,
	});

	getCostControlInvoice.map((eachInvoice) => {
		eachInvoice.items = [];
		getCostControlInvoicingDetail.map((eachDetail) => {
			eachDetail.cost_invoicing_id === eachInvoice.id && eachInvoice.items.push(eachDetail);
		});
	});

	res.json(getCostControlInvoice);
});

router.post('/project_invoice', async (req, res) => {
	const { project_id, name, created_by, created_on, invoicingItems, qb_invoice_num } =
		req.body.values;

	try {
		const cost_invoicing_id = await knex(postCostControlInvoicingDB)
			.insert({
				project_id: project_id,
				created_by: created_by,
				created_on: created_on,
				name: name,
				qb_invoice_num: qb_invoice_num,
			})
			.returning('id');
		const fieldsToInsert = invoicingItems.map((item) => ({
			cost_control_id: item.invoicing_id,
			amount_completed: item.amount_completed,
			value_of_completed: item.value_of_completed,
			created_by: created_by,
			created_on: created_on,
			project_id: project_id,
			cost_invoicing_id: cost_invoicing_id[0],
		}));
		const resCostControlItems = await knex(postCostControlInvoicingDetailDB)
			.insert(fieldsToInsert)
			.returning('*');

		res.status(200).json({ accepted: true, message: 'Project Invoicing was updated' });
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
