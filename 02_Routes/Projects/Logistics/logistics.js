const express = require('express');
const router = express.Router();
const database = require('../../../01_Database/database');
const knex = require('../../../01_Database/connection');

router.get('/allWorkorderDetails/:id', async (req, res) => {
	const { id } = req.params;

	const allWorkorders = await knex(database.getWorkordersDB)
		.select('workorder_name', 'workorder_quantity_total', 'quantity_total_completed')
		.where({ project_id: id })
		.andWhere({ deleted: 0 });

	res.json(allWorkorders);
});

router.get('/allProjectDetails/:id', async (req, res) => {
	const { id } = req.params;

	const workorders = database.getWorkordersDB;
	const workorderItems = database.getWorkordersItemsDB;
	const workorderItemsDetail = database.getWorkordersItemsDetailsDB;

	const totalQuantity = await knex(workorderItems)
		.sum({ amount: `${workorderItems}.quantity` })
		.leftJoin(workorders, `${workorders}.workorder_id`, `${workorderItems}.workorder_id`)
		.where({ [`${workorders}.project_id`]: id })
		.andWhere({ [`${workorderItems}.deleted`]: 0 })
		.andWhere({ [`${workorders}.deleted`]: 0 });

	const totalCompleted = await knex(workorderItemsDetail)
		.count({ amount: '*' })
		.leftJoin(workorders, `${workorders}.workorder_id`, `${workorderItemsDetail}.workorder_id`)
		.whereNotNull(`${workorderItemsDetail}.shop_approved_id`)
		.andWhere({ [`${workorders}.project_id`]: id })

		.andWhere({ [`${workorders}.deleted`]: 0 });

	res.json({ total: totalQuantity[0], completed: totalCompleted[0] });
});

module.exports = router;
