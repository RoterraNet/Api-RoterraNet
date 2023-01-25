const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');

const database = require('../01_Database/database');
const getUserNotificationsDB = database.getUserNotificationsDB;
const postUserNotificationsDB = database.postUserNotificationsDB;

// // /get all user Items  -> GET ALL
router.get('/getNotifications/:id', async (req, res) => {
	const { id } = req.params;

	const allNotifications = await knex(getUserNotificationsDB)
		.select('*')
		.where({ user_id: id })
		.andWhere({ seen: false });

	res.send(allNotifications);
});

router.put('/updateNotifications', async (req, res) => {
	const { values } = req.body;

	const allNotifications = await knex(getUserNotificationsDB)
		.update(values.update)
		.where({ id: values.id });

	res.send('allNotifications');
});

const postUserNotification = async (user_id, title, description, created_on, url) => {
	console.log('start');
	try {
		await knex(getUserNotificationsDB).insert({
			user_id: user_id,
			title: title,
			description: description,
			created_on: created_on,
			url: url,
		});
		console.log('posted');
	} catch (error) {
		console.log(error);
	}
};

module.exports = router;
