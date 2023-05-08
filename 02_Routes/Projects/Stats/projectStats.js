const express = require('express');
const { getProjectsDB, getWorkordersItemsDB } = require('../../../01_Database/database');

const router = express.Router();
const knex = require('../../../01_Database/connection');
const authorize = require('../../Authorization/authorization');

router.get('/getStats/:project_id', authorize(), async (req, res) => {
	const { project_id } = req.params;
	try {
		const projectStats = await knex(getProjectsDB)
			.select('contract_total', 'quote_id', 'pile_count')
			.where({ id: project_id });

		const workorderStats = await knex(getWorkordersItemsDB)
			.select('quantity_completed_pipe', 'quantity_completed_shop', 'quantity')
			.where({ project_id: project_id })
			.andWhere('status_order', '>', 3)
			.andWhere({ deleted: 0 });

		const totalOrder = () => {
			let quantity = 0;
			let quantity_completed_shop = 0;
			let quantity_completed_pipe = 0;

			workorderStats.map((each) => {
				quantity = quantity + parseInt(each.quantity);
				quantity_completed_shop =
					quantity_completed_shop + parseInt(each.quantity_completed_shop);
				quantity_completed_pipe =
					quantity_completed_pipe + parseInt(each.quantity_completed_pipe);
			});
			return {
				quantity,
				quantity_completed_shop,
				quantity_completed_pipe,
			};
		};

		const allStats = { ...totalOrder(), ...projectStats[0] };

		res.json(allStats);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: 'something went wrong,', error: error });
	}
});

module.exports = router;
