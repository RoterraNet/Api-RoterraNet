const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');

const database = require('../01_Database/database');
const getItemTrackingDB = database.getItemTrackingDB;
const postItemTrackingDB = database.postItemTrackingDB;

const getItemTrackingItemsDB = database.getItemTrackingItemsDB;

// // /get all user Items  -> GET ALL
router.get('/getUserItems/:id', async (req, res) => {
	const user_id = parseInt(req.params.id);

	const getItems = await knex(getItemTrackingDB)
		.where({ user_id: user_id })
		.where({ deleted: false })
		.orderBy('id');

	res.json(getItems);
});

router.get('/allTrackingItems/', async (req, res) => {
	const getItems = await knex(getItemTrackingItemsDB).orderBy('value', 'asc');

	res.json(getItems);
});

router.put('/', async (req, res) => {
	const { values } = req.body;
	try {
		const getItems = await knex(postItemTrackingDB).update(values).where({ id: values.id });
		res.status(202).json({ message: 'Updated Tracking information', color: 'success' });
	} catch (error) {
		console.log(error);
		res.status(500).json({
			errorMessage: error,
			message: 'Something Went Wrong',
			color: 'error',
		});
	}
});

router.post('/', async (req, res) => {
	const { values } = req.body;
	try {
		const getItems = await knex(postItemTrackingDB).insert(values).where({ id: values.id });
		res.status(202).json({ message: 'Added Tracking information', color: 'success' });
	} catch (error) {
		console.log(error);
		res.status(500).json({
			errorMessage: error,
			message: 'Something Went Wrong',
			color: 'error',
		});
	}
});

router.put('/delete/', async (req, res) => {
	const { values } = req.body;
	try {
		const getItems = await knex(postItemTrackingDB)
			.update(values.update)
			.where({ id: values.id });
		res.status(202).json({ message: 'Deleted Tracking Item', color: 'success' });
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
