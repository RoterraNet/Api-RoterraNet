const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');

const database = require('../01_Database/database');
const postUsersEmploymentRecordDB = database.postUsersEmploymentRecordDB;
const getUsersEmploymentRecordDB = database.getUsersEmploymentRecordDB;

router.get('/:id', async (req, res) => {
	const { id: user_id } = req.params;
	const getRecords = await knex(getUsersEmploymentRecordDB)
		.select(
			'position_name',
			'position_id',
			'manager_name',
			'manager_id',
			'start_date',
			'end_date',
			'id',
			'reason'
		)
		.where({ user_id: user_id })
		.andWhere({ deleted: false })
		.orderBy('end_date', 'desc')
		.orderBy('start_date', 'desc');

	res.send(getRecords);
});

router.post('/add_record', async (req, res) => {
	const { values } = req.body;
	try {
		const addRecordResponse = await knex(postUsersEmploymentRecordDB)
			.insert(values)
			.returning('id');
		res.status(202).json({ message: 'Employment Information was Added', color: 'success' });
	} catch (error) {
		res.status(500).json({ message: 'Something Went Wrong', color: 'error', error: error });
		console.log(error);
	}
});

router.put('/update_record', async (req, res) => {
	const { values } = req.body;
	try {
		const addRecordResponse = await knex(postUsersEmploymentRecordDB)
			.update(values.update)
			.where({ id: values.id })
			.returning('id');

		res.status(202).json({ message: 'Employment Information was updated', color: 'success' });
	} catch (error) {
		res.status(500).json({ message: 'Something Went Wrong', color: 'error', error: error });
		console.log(error);
	}
});

router.put('/delete_record', async (req, res) => {
	const { values } = req.body;
	try {
		const deletedRecord = await knex(postUsersEmploymentRecordDB)
			.update(values.deleteInfo)
			.where({ id: values.id });

		res.status(202).json({ message: 'Employment Information was Deleted', color: 'success' });
	} catch (error) {
		res.status(500).json({ message: 'Something Went Wrong', color: 'error', error: error });
		console.log(error);
	}
});

module.exports = router;
