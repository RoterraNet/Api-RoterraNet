const express = require('express');

const router = express.Router();
const knex = require('../01_Database/connection');

const database = require('../01_Database/database');
const postSuppliersCriteriaDB = database.postSuppliersCriteriaDB;
const getSuppliersCriteriaDB = database.getSuppliersCriteriaDB;

// /suppliersCriteria -> GET
router.get('/:sup_id', async (req, res) => {
	const { sup_id } = req.params;

	const getSuppliersCriteria = await knex(getSuppliersCriteriaDB)
		.select(
			'prequal',
			'requirements',
			'price',
			'reputation',
			'capability',
			'financial',
			'reference',
			'review'
		)
		.where('supplier_id', '=', sup_id)
		.returning('*');
	console.log('supplier c', sup_id);
	res.status(202).send(getSuppliersCriteria);
});

router.post('/', async (req, res) => {
	const { values } = req.body;
	try {
		const postSuppliersCriteria = await knex(postSuppliersCriteriaDB)
			.insert({
				supplier_id: values.supplier_id,
				capability: values.capability ? 1 : 0,
				price: values.price ? 1 : 0,
				reputation: values.reputation ? 1 : 0,
				requirements: values.requirements ? 1 : 0,
				review: values.review ? 1 : 0,
				prequal: values.prequal ? 1 : 0,
			})
			.returning('id');
		res.status = 202;
		res.json({ msg: 'Supplier Risk Criteria was added', criteria_id: postSuppliersCriteria });
	} catch (e) {
		res.status = 500;
		res.json({ error: e, msg: 'Something went wrong. Check Error' });
	}
});
module.exports = router;
