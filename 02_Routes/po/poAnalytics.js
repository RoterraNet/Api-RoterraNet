const express = require('express');

const router = express.Router({ mergeParams: true });

const knex = require('../../01_Database/connection');
const database = require('../../01_Database/database');

router.get('/totalSums', async (req, res) => {
	const { start, end } = req.query;

	const getSums = await knex(database.getPoDB)
		.sum('sum_quantity as total_quantity')
		.sum('sum_received_quantity as total_received')
		.sum('sum_extended_cost as total_cost')
		.whereBetween('created_on', [start, end])
		.andWhere({ deleted: 0 });

	res.json(getSums);
});

router.get('/totalSumsOfUsers', async (req, res) => {
	const { start, end, type } = req.query;

	const typeCheck = () => {
		if (type === 'requisitioned_for_name') {
			return { name: 'requisitioned_for_name', id: 'requisitioned_for' };
		} else {
			return { name: 'requisitioned_by_name', id: 'requisitioned_by' };
		}
	};
	try {
		const getSums = await knex(database.getPoDB)
			.select(
				`${typeCheck().name} as name`,
				`${typeCheck().id} as id`,
				knex.raw(
					'round(sum(sum_quantity), 2) as total_quantity, round(sum(sum_received_quantity), 2) as total_received,round(sum(sum_extended_cost), 2) as total_cost'
				)
			)

			.whereBetween('created_on', [start, end])
			.andWhere({ deleted: 0 })
			.groupBy(typeCheck().name, typeCheck().id)
			.orderBy(typeCheck().name, 'asc');

		res.json(getSums);
	} catch (error) {
		console.log(error);
		res.send({ error: error, msg: 'something went wrong' });
	}
});

router.get('/totalSumsOfGlCode', async (req, res) => {
	const { start, end } = req.query;

	console.log(start, end);
	try {
		const getSums = await knex(database.getPoDetailDB)
			.select('gl_description', knex.raw('round(sum(extended_cost), 2) as extended_cost'))
			.whereBetween('created_on', [start, end])
			.andWhere({ deleted: false })
			.groupBy('gl_description')
			.orderBy('gl_description');
		res.json(getSums);
	} catch (error) {
		console.log(error);
		res.send({ error: error, msg: 'An Error Occurred' });
	}
});

router.get('/getExtraUserDetail', async (req, res) => {
	const { start, end, getParamsId } = req.query;

	try {
		const getDetail = await knex(database.getPoDB)
			.sum('sum_quantity as total_quantity')
			.sum('sum_received_quantity as total_received')
			.sum('sum_extended_cost as total_cost')
			.whereBetween('created_on', [start, end])
			.andWhere({ deleted: 0 })
			.andWhere({ requisitioned_for: getParamsId });

		res.json(getDetail);
	} catch (error) {
		console.log(error);
		res.send({ error: error, msg: 'An Error Occurred' });
	}
});

router.get('/getExtraUserDetailGlUsage', async (req, res) => {
	const { start, end, getParamsId, type } = req.query;

	const typeCheck = () => {
		if (type === 'requisitioned_for_name') {
			return 'requisitioned_for';
		} else {
			return 'requisitioned_by';
		}
	};
	try {
		const getDetail = await knex(database.getPoDetailDB)
			.sum('quantity as total_quantity')
			.sum('extended_cost as total_extended')
			.select('job_number')
			.whereBetween('created_on', [start, end])
			.andWhere({ deleted: false })
			.andWhere({
				[type === 'requisitioned_for_name' ? 'requisitioned_for' : 'requisitioned_by']:
					getParamsId,
			})
			.groupBy('job_number');

		res.json(getDetail);
	} catch (error) {
		console.log(error);
		res.send({ error: error, msg: 'An Error Occurred' });
	}
});

module.exports = router;
