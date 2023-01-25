const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');

const database = require('../01_Database/database');
const getUsersOnboardingDB = database.getUsersOnboardingDB;
const postUsersOnboardingDB = database.postUsersOnboardingDB;
const getUsersOffboardingDB = database.getUsersOffboardingDB;
const postUsersOffboardingDB = database.postUsersOffboardingDB;

// // /get all performance reviews  -> GET ALL
router.get('/onboarding/:id', async (req, res) => {
	const user_id = parseInt(req.params.id);

	const getBoarding = await knex(getUsersOnboardingDB).select('*').where({ user_id: user_id });

	res.json(getBoarding);
});

router.post('/onboarding/', async (req, res) => {
	const { name, change_by_value, user_id } = req.body.values;

	const rawInsertSql = knex.raw(`(${name}, user_id) VALUES (${change_by_value},  ${user_id})`);

	let updateInsertRes;
	console.log(user_id);
	try {
		const select = await knex(postUsersOnboardingDB)
			.select('user_id')
			.where({ user_id: user_id });

		if (select.length === 0) {
			console.log('nothing found');
			updateInsertRes = await knex(postUsersOnboardingDB)
				.insert(rawInsertSql)
				.returning('id');
		} else {
			console.log('found');
			updateInsertRes = await knex.raw(
				`UPDATE ${postUsersOnboardingDB} SET ${name}=${change_by_value}  WHERE user_id=${user_id};`
			);
		}
		res.status(202).json({ message: 'OnBoarding Information was updated', color: 'success' });
	} catch (error) {
		console.log(error);
		res.status(500).json({
			errorMessage: error,
			message: 'Something Went Wrong',
			color: 'error',
		});
	}
});

router.get('/offboarding/:id', async (req, res) => {
	const user_id = parseInt(req.params.id);

	const getBoarding = await knex(getUsersOffboardingDB).select('*').where({ user_id: user_id });

	res.json(getBoarding);
});

router.post('/offboarding/', async (req, res) => {
	const { name, change_by_value, user_id } = req.body.values;
	const rawInsertSql = knex.raw(`(${name}, user_id) VALUES (${change_by_value},  ${user_id})`);
	let updateInsertRes;
	try {
		const select = await knex(postUsersOffboardingDB)
			.select('id', 'user_id')
			.where({ user_id: user_id });

		if (select.length === 0) {
			console.log('nothing found');
			updateInsertRes = await knex(postUsersOffboardingDB)
				.insert(rawInsertSql)
				.returning('id');
		} else {
			console.log('found');
			updateInsertRes = await knex.raw(
				`UPDATE ${postUsersOffboardingDB} SET ${name}=${change_by_value}  WHERE user_id=${user_id};`
			);
		}
		res.status(202).json({ message: 'OffBoarding Information was updated', color: 'success' });
	} catch (error) {
		console.log(error);
		res.status(500).json({
			errorMessage: error,
			message: 'Something Went Wrong',
			color: 'error',
		});
	}
});

module.exports = router;
