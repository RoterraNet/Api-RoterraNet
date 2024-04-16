const express = require('express');
const {
	getUsersBenefitsDB,
	getUsersReviewsDB,
	postUsersReviewsDB,
	getUsersDB,
	postUsersOnboardingDB,
	postUsersDB,
} = require('../../01_Database/database');
const router = express.Router();
const knex = require('../../01_Database/connection');
const { format } = require('date-fns');

const authorize = require('../Authorization/authorization');

router.get(`/getNewHires`, async (req, res) => {
	const { page, perPage } = req.query;

	// const newHires = await knex(getUsersDB)
	// 	.leftJoin(postUsersOnboardingDB, postUsersDB, 'roterranet.users_onboarding.user_id')
	// 	.whereNull('onboarding.user_id')
	// 	.select('users.*')
	// 	.toString();

	const newHires = await knex('roterranet.view_users')
		.leftJoin(
			'roterranet.users_onboarding',
			'roterranet.view_users.user_id',
			'roterranet.users_onboarding.user_id'
		)
		.where('roterranet.view_users.deleted', 0)
		.whereNull('roterranet.users_onboarding.user_id')
		.select('roterranet.view_users.*');

	// .select()
	// 	.where({ deleted: 0 })
	// 	.whereRaw("start_date::date > '2024-03-03'")
	// 	.orderBy('start_date', 'desc')
	// .paginate({
	// 	perPage: 10,
	// 	currentPage: 1,
	// 	isLengthAware: true,
	// });

	res.status(200).json(newHires);
});

router.get(`/table`, async (req, res) => {
	const { page, perPage, monthYear } = req.query;
	const [year, month] = monthYear.split('-');
	const projectStats = await knex(getUsersBenefitsDB)
		.select(
			'user_id',
			'preferred_name',
			'start_date',
			'type_of_reminder',
			'active_reminder_date'
		)
		.whereRaw(`EXTRACT(MONTH FROM active_reminder_date::date) = ?`, [month])
		.andWhere({ deleted: 0 })
		.orderBy('preferred_name', 'asc')
		.paginate({
			perPage: 10,
			currentPage: 1,
			isLengthAware: true,
		});

	const userReviews = await knex(getUsersReviewsDB)
		.select('user_id', 'completed_by', 'completed_on')
		.andWhereRaw(`EXTRACT(YEAR FROM completed_on::date) = ?`, [year]);

	projectStats.data.map((each) => {
		userReviews.map(({ user_id: completed, completed_on, completed_by }) => {
			if (each.user_id === completed) {
				each.completed = true;
				each.completed_on = completed_on;
				each.completed_by = completed_by;
			}
		});
	});

	res.status(200).json(projectStats);
});

router.post(`/review/completed`, authorize(), async (req, res) => {
	const { created_on, created_by, user_id, comments, completed_by, completed_on } = req.body;

	console.log(req.body);
	const projectStats = await knex(postUsersReviewsDB).insert({
		created_on: created_on,
		created_by: created_by,
		user_id: user_id,
		comments: comments,
		completed_by: completed_by,
		completed_on: completed_on,
	});

	res.status(200).json('projectStats');
});

module.exports = router;
