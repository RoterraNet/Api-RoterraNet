const express = require('express');
const { getUsersBenefitsDB } = require('../../01_Database/database');
const router = express.Router();
const knex = require('../../01_Database/connection');
const { format } = require('date-fns');

const authorize = require('../Authorization/authorization');

router.get(`/table`, async (req, res) => {
	const { page, perPage, monthYear } = req.query;
	const [year, month] = monthYear.split('-');
	const projectStats = await knex(getUsersBenefitsDB)
		.select('user_id', 'preferred_name', 'start_date', 'type_of_reminder', 'reimnder_date_test')
		.whereRaw(`EXTRACT(MONTH FROM reimnder_date_test::date) = ?`, [month])
		.andWhere({ deleted: 0 })
		.orderBy('preferred_name', 'asc')
		.paginate({
			perPage: 10,
			currentPage: 1,
			isLengthAware: true,
		});
	const test = [
		{ user_id: 664, completed_date: '2023-may-18' },
		{ user_id: 2, completed_date: '2023-June-3' },
		{ user_id: 502, completed_date: '2023-march-11' },
	];

	projectStats.data.map((each) => {
		test.map(({ user_id: completed, completed_date }) => {
			if (each.user_id === completed) {
				each.completed = true;
				each.completed_date = completed_date;
			}
		});
	});

	res.status(200).json(projectStats);
});

router.post(`/review/completed`, authorize(), async (req, res) => {
	const { body } = req;

	console.log(body);
	// const projectStats = await knex(getUsersBenefitsDB).select(
	// 	'user_id',
	// 	'preferred_name',
	// 	'start_date',
	// 	'type_of_reminder',
	// 	'reimnder_date_test'
	// );

	res.status(200).json('projectStats');
});

module.exports = router;
