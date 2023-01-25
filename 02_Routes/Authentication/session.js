const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');

const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24; // A day in milliseconds

router.post('/sign_in', async (request, response) => {
	const params = request.body;

	try {
		const user = await knex('users').where('email', params.email).first();
		if (!user) {
		}
		if (user.password !== params.password) {
			throw new Error('Incorrect Password');
		}
		response.json({ status: 'success', email: user.email, userId: user.id });
	} catch (error) {
		response.json({
			status: 'fail',
			message: 'Incorrect Username or Password',
		});
	}
});

module.exports = router;
