const express = require('express');

const knex = require('../01_Database/connection');
const router = express.Router();
const database = require('../01_Database/database');
const getNotificationSettingsDB = database.getNotificationSettingsDB;

router.get(`/getall/:id`, async (req, res) => {
	const { id } = req.params;
	try {
		const notificationSettings = await knex(getNotificationSettingsDB)
			.select('*')
			.where({ user_id: id });
		res.send(notificationSettings);
	} catch (e) {
		res.send({ error: e, msg: 'something went wrong' });
	}
});

router.put(`/updateSettings/`, async (req, res) => {
	const { values } = req.body;

	// Update for user Setting

	const notificationSettings = await knex(getNotificationSettingsDB)
		.update({
			...values.update,
		})
		.where({ user_id: values.user_id })
		.returning('*');
	res.send(notificationSettings);
});
module.exports = router;
