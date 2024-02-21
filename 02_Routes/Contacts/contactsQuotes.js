const express = require('express');
const router = express.Router();
const database = require('../../01_Database/database');
const authorize = require('../Authorization/authorization');

const knex = require('../../01_Database/connection');

const getQuotesDB = database.getQuotesDB;

router.get(`/table`, authorize({}), async (req, res) => {
	const { start, size, filters, sorting, globalFilter, contact_id } = req.query;
	console.log(contact_id);
	const parsedColumnFilters = JSON.parse(filters);

	const paginatedTable = await knex(getQuotesDB)
		.select(
			'quote_id',
			'customer_name',
			'contact_name',
			'customer_id',
			'created_on',
			'project_identifier',
			'workorder_id',
			'project_id',
			'quote_status_description'
		)

		.modify((builder) => {
			if (!!parsedColumnFilters.length) {
				parsedColumnFilters.map((filter) => {
					const { id: columnId, value: filterValue } = filter;

					builder.whereRaw(`${columnId}::text iLIKE ?`, [`%${filterValue}%`]);
				});
			}
		})
		.where({ deleted: 0 })
		.andWhere({ contact_id: contact_id })
		.orderBy('quote_id', 'desc')

		.paginate({
			perPage: size,
			currentPage: start,
			isLengthAware: true,
		});

	res.status(200).json(paginatedTable);
});

module.exports = router;
