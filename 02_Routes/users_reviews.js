const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');

const database = require('../01_Database/database');
const getUsersPerformanceReviewDB = database.getUsersPerformanceReviewDB;
const postUsersPerformanceReviewDB = database.postUsersPerformanceReviewDB;
const getUsersDisciplineReviewDB = database.getUsersDisciplineReviewDB;
const postUsersDisciplineReviewDB = database.postUsersDisciplineReviewDB;
// // /get all performance reviews  -> GET ALL
router.get('/allreviews/:id', async (req, res) => {
	const user_id = parseInt(req.params.id);

	const getAllPerformanceReviews = await knex(getUsersPerformanceReviewDB)
		.select(
			'id',
			'user_id',
			'review_by',
			'review_on',
			'type_of_review',
			'review_detail',
			'full_name'
		)
		.where({ user_id: user_id, deleted: false })
		.orderBy('review_on', 'acs');
	const getAllDisciplineReviews = await knex(getUsersDisciplineReviewDB)
		.select(
			'id',
			'user_id',
			'review_by',
			'review_on',
			'type_of_discipline',
			'discipline_detail',
			'discipline_reason',
			'full_name'
		)
		.where({ user_id: user_id, deleted: false })
		.orderBy('review_on', 'acs');

	res.json({
		employmentReviews: getAllPerformanceReviews,
		disciplineReviews: getAllDisciplineReviews,
	});
});

router.post('/performancereview/', async (req, res) => {
	const { user_id, review_by, review_on, type_of_review, review_detail } = req.body.values;
	const postNewPerformanceReview = await knex(postUsersPerformanceReviewDB)
		.insert({
			user_id: user_id,
			review_by: review_by,
			review_on: review_on,
			type_of_review: type_of_review,
			review_detail: review_detail,
		})
		.returning('id');

	res.json(postNewPerformanceReview);
});

router.put('/performancereview/', async (req, res) => {
	const { id, type_of_review, review_on, review_detail, deleted } = req.body;
	const updatedPerformanceReview = await knex(postUsersPerformanceReviewDB)
		.update({
			type_of_review: type_of_review,
			review_on: review_on,
			review_detail: review_detail,
			deleted: deleted,
		})
		.where({ id: id });

	res.json({ message: 'Successfully updated performance review', color: 'success' });
});

router.post('/disciplinereview/', async (req, res) => {
	const {
		user_id,
		review_by,
		review_on,
		type_of_discipline,
		discipline_detail,
		discipline_reason,
	} = req.body.values;
	const postNewPerformanceReview = await knex(postUsersDisciplineReviewDB)
		.insert({
			user_id: user_id,
			review_by: review_by,
			review_on: review_on,
			type_of_discipline: type_of_discipline,
			discipline_detail: discipline_detail,
			discipline_reason: discipline_reason,
		})
		.returning('id');

	res.json(postNewPerformanceReview);
});

router.put('/disciplinereview/', async (req, res) => {
	const { id, type_of_discipline, review_on, discipline_detail, discipline_reason, deleted } =
		req.body;

	console.log(req.body);
	const updatedDisciplineReview = await knex(postUsersDisciplineReviewDB)
		.update({
			type_of_discipline: type_of_discipline,
			review_on: review_on,
			discipline_detail: discipline_detail,
			discipline_reason: discipline_reason,
			deleted: deleted,
		})
		.where({ id: id });

	res.json({ message: 'Successfully updated discipline review', color: 'success' });
});

router.post('/reminder_date/', async (req, res) => {
	const { reminder_date, user_id } = req.body.values;

	const select = await knex(database.postUsersBenefitsDB)
		.select('id', 'user_id')
		.where({ user_id: user_id });
	let updateInsertRes;

	try {
		if (select.length === 0) {
			console.log('nothing found');
			updateInsertRes = await knex(database.postUsersBenefitsDB)
				.insert({
					user_id: user_id,
					reminder_date: reminder_date,
				})
				.returning('id');
		} else {
			console.log('found');
			updateInsertRes = await knex(database.postUsersBenefitsDB)
				.where({ user_id: user_id })
				.update({
					reminder_date,
				})
				.returning('id');
			res.status(202).json({ message: 'Reminder Date was Updated', color: 'success' });
		}
	} catch (error) {
		res.status(200).json({
			errorMessage: error,
			message: 'Something Went Wrong',
			color: 'error',
		});
	}
});

module.exports = router;

//
