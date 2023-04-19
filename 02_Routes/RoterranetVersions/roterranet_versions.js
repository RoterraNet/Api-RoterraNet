const express = require('express');

const router = express.Router();
const knex = require('../../01_Database/connection');

const { getRoterraNetVersionsDB, postRoterraNetVersionsDB } = require('../../01_Database/database');
const authorize = require('../Authorization/authorization');

router.get('/table', authorize(), async (req, res) => {
	const { pageIndex, pageSize } = req.query;

	const getVersionsDetail = await knex(getRoterraNetVersionsDB)
		.where({ deleted: false })
		.orderBy('id', 'desc')
		.paginate({
			perPage: pageSize,
			currentPage: pageIndex,
			isLengthAware: true,
		});

	res.json(getVersionsDetail);
});

router.post('/createVersion', authorize(), async (req, res) => {
	const { version, detail, created_on, created_by, date } = req.body;

	try {
		const createNew = await knex(postRoterraNetVersionsDB).insert({
			version,
			detail,
			created_on,
			created_by,
			date,
		});

		res.status(202).json({ msg: 'Version was created', color: 'success' });
	} catch (e) {
		console.log(e);
		res.status(500).json({ msg: 'Something went Wrong', color: 'error', error: e });
	}
});

module.exports = router;
