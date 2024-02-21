const express = require('express');
const router = express.Router();
const database = require('../../01_Database/database');
const authorize = require('../Authorization/authorization');

const knex = require('../../01_Database/connection');

const getProjectDB = database.getProjectsDB;

router.get(`/table`, authorize({}), async (req, res) => {
	const { start, size, filters, sorting, globalFilter, contact_id } = req.query;
	console.log(contact_id);
	const parsedColumnFilters = JSON.parse(filters);

	const paginatedTable = await knex(getProjectDB)
		.select()
		.modify((builder) => {
			if (!!parsedColumnFilters.length) {
				parsedColumnFilters.map((filter) => {
					const { id: columnId, value: filterValue } = filter;

					builder.whereRaw(`${columnId}::text iLIKE ?`, [`%${filterValue}%`]);
				});
			}
		})

		.andWhere({ contact_id: contact_id })
		// .orderBy('quote_id', 'desc')

		.paginate({
			perPage: size,
			currentPage: start,
			isLengthAware: true,
		});

	res.status(200).json(paginatedTable);
});

module.exports = router;
