const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');

const database = require('../01_Database/database');
const getMaterialTrackingFiles = database.getMaterialTrackingFiles;
const postMaterialTrackingFiles = database.postMaterialTrackingFiles;

router.post('/', async (req, res) => {
	const values = req.body.values;

	console.log(values);
	const saveData = await knex(postMaterialTrackingFiles)
		.insert({
			mtr_id: values.mtr_id,
			mtr_detail_id: values.mtr_detail_id,
			file_name: values.file_name,
			location: values.location,
			created_by: values.created_by,
			created_on: values.created_on,
		})
		.returning('id');
	res.json(saveData[0]);
});

router.get('/:id', async (req, res) => {
	const id = req.params.id;
	const getData = await knex(postMaterialTrackingFiles)
		.select('mtr_id', 'mtr_detail_id', 'file_name', 'location', 'created_by', 'created_on')
		.where({ mtr_id: id });
	res.json(getData);
});

module.exports = router;
