const express = require('express');
const knex = require('../../01_Database/connection');
const authorize = require('../Authorization/authorization');
const { getQuotesDB } = require('../../01_Database/database');
const router = express.Router();

router.get(`/table`, authorize(), async (req, res) => {
	const { start, size, filters, sorting, globalFilter } = req.query;

	const parsedColumnFilters = JSON.parse(filters);
	const parsedColumnSorting = JSON.parse(sorting);

	const paginatedTable = await knex(getQuotesDB)
		.select()
		.modify((builder) => {
			if (!!parsedColumnFilters.length) {
				parsedColumnFilters.map((filter) => {
					const { id: columnId, value: filterValue } = filter;

					builder.whereRaw(`${columnId}::text iLIKE ?`, [`%${filterValue}%`]);
				});
			}
			if (!!parsedColumnSorting.length) {
				parsedColumnSorting.map((sort) => {
					const { id: columnId, desc: sortValue } = sort;

					const sorter = sortValue ? 'desc' : 'acs';
					console.log(columnId, sortValue, sorter);
					builder.orderBy(columnId, sorter);
				});
			} else {
				builder.orderBy('quote_id', 'desc');
			}
		})

		.paginate({
			perPage: size,
			currentPage: start,
			isLengthAware: true,
		});

	res.status(200).json(paginatedTable);
});

module.exports = router;
