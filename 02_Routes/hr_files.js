const { yearsToMonths } = require('date-fns');
const express = require('express');
const router = express.Router({ mergeParams: true });
const knex = require('../01_Database/connection');

const database = require('../01_Database/database');
const getHrFilesDB = database.getHrFilesDB;
const postHrFilesDB = database.postHrFilesDB;

// / -> GET ALL FILES
router.get('/', async (req, res) => {
	const { type } = req.query;
	try {
		if (type !== 'news_letters') {
			const getAllFiles = await knex(getHrFilesDB)
				.select('hr_file_id', 'file_name', 'url', 'section')
				.where({ deleted_by: null })
				.andWhere(type, '=', true)
				.orderBy('file_name', 'asc');
			res.json(getAllFiles);
		} else {
			const rawSql = knex.raw(`DATE_PART('year', date) AS year`);
			const getAllYears = await knex(getHrFilesDB)
				.select(rawSql)
				.whereNotNull('date')
				.groupByRaw(`DATE_PART('year', date)`);

			const getAllFiles = await knex(getHrFilesDB)
				.select('hr_file_id', 'file_name', 'url', 'section', 'date')
				.where({ deleted_by: null })
				.andWhere(type, '=', true)
				.orderBy('date', 'asc')
				.whereNotNull('date');

			getAllYears.map((date) => {
				date.newsLetters = [];
				getAllFiles.map((newsLetter) => {
					if (date.year == new Date(newsLetter.date).getFullYear()) {
						date.newsLetters.push(newsLetter);
					}
				});
			});

			res.json(getAllYears);
		}
	} catch (error) {
		console.log(error);
		return res.status(503).send({
			message: 'This is an error!',
			error: error,
		});
	}
});

router.post('/', async (req, res) => {
	const { values } = req.body;

	try {
		const addNewFile = await knex(postHrFilesDB).insert(values).returning('file_name');
		res.status(202).send({ response: addNewFile });
	} catch (e) {
		return res.status(503).send({
			message: 'This is an error!',
			error: e,
		});
	}
});

router.put('/', async (req, res) => {
	const { hr_file_id, deleted_by, deleted_on } = req.body.values;

	try {
		const deleteFile = await knex(postHrFilesDB)
			.where({ hr_file_id: hr_file_id })
			.update({ deleted_by: deleted_by, deleted_on: deleted_on })
			.returning('url');

		res.status(202).send({ response: deleteFile });
	} catch (e) {
		return res.status(503).send({
			message: 'This is an error!',
			error: e,
		});
	}
});

module.exports = router;
