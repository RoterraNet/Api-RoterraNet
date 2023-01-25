const express = require('express');
const router = express.Router({ mergeParams: true });
const knex = require('../01_Database/connection');

const database = require('../01_Database/database');
const getWorkorderFilessDB = database.getWorkorderFilesDB;
const postWorkorderFilesDB = database.postWorkorderFilesDB;

const datefns = require('date-fns');
const today_now = datefns.format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

// /workorders/:id/ -> GET ALL FILES for that Workorder
router.get('/:id', async (req, res) => {
	const { id } = req.params;
	const getAllFiles = await knex(getWorkorderFilessDB)
		.select('*')
		.where(`workorder_id`, '=', id)
		.andWhere({ deleted_by: null })
		.orderBy('workorder_file_id', 'desc');
	res.json(getAllFiles);
});

router.post('/', async (req, res) => {
	const body = req.body;
	const { user_id, values } = body;
	console.log('values', values);
	try {
		const addNewFile = await knex(postWorkorderFilesDB)
			.insert({ ...values })
			.returning('workorder_file_id');
		res.status(202).send({ response: addNewFile });
	} catch (e) {
		return res.status(503).send({
			message: 'This is an error!',
			error: e,
		});
	}
});

router.put('/', async (req, res) => {
	const body = req.body;
	const { user_id, values } = body;

	try {
		const addNewFile = await knex(postWorkorderFilesDB)
			.where('workorder_file_id', '=', values.workorder_file_id)
			.update({ url: values.url })
			.returning('url');

		res.status(202).send({ response: addNewFile });
	} catch (e) {
		return res.status(503).send({
			message: 'This is an error!',
			error: e,
		});
	}
});

router.put('/delete', async (req, res) => {
	const body = req.body;
	const { user_id, values } = body;

	try {
		const deleteFile = await knex(postWorkorderFilesDB)
			.where('workorder_file_id', '=', values.workorder_file_id)
			.update({ deleted_by: values.deleted_by, deleted_on: values.deleted_on })
			.returning('file_name');

		res.status(202).send({ response: `File ${deleteFile[0]} was deleted.` });
	} catch (e) {
		return res.status(503).send({
			message: 'This is an error!',
			error: e,
		});
	}
});

module.exports = router;
