const express = require('express');
const router = express.Router();
const database = require('../../../01_Database/database');
const knex = require('../../../01_Database/connection');

const postWorkordersItemsDB = database.postWorkordersItemsDB;

router.put('/update/', async (req, res) => {
	const { workorderId, update } = req.body.values;

	try {
		update.piles.map(async (eachPile) => {
			await knex(postWorkordersItemsDB)
				.update({
					workorder_item_line_item: eachPile.workorder_item_line_item,
				})
				.where({ workorder_item_id: eachPile.workorder_item_id });
		});

		update.addOns.map(async (eachAddOn) => {
			await knex(postWorkordersItemsDB)
				.update({
					workorder_item_line_item: eachAddOn.workorder_item_line_item,
				})
				.where({ workorder_item_id: eachAddOn.workorder_item_id });
		});

		res.json({ message: 'Line Items have been updated', color: 'success' });
	} catch (error) {
		res.json({ message: 'Something Went Wrong', color: 'error', error: error });
	}
});

module.exports = router;
