const express = require('express');
const router = express.Router();
const database = require('../01_Database/database');
const authorize = require('./Authorization/authorization');

const getTableRoute = require('./RouteCreaters/getTable');
const knex = require('../01_Database/connection');

const getPoAdvancedSearchDB = database.getPoAdvancedSearchDB;

// po -> PATCH -> TABLE -> get all quotes paginated
getTableRoute.getTableData(router, getPoAdvancedSearchDB);

router.get(`/table`, authorize({}), async (req, res) => {
	const { start, size, filters, sorting, globalFilter } = req.query;

	const parsedColumnFilters = JSON.parse(filters);
	const parsedColumnSorting = JSON.parse(sorting);

	const paginatedTable = await knex(getPoAdvancedSearchDB)
		.select()

		.modify((builder) => {
			if (!!parsedColumnFilters.length) {
				parsedColumnFilters.map((filter) => {
					const { id: columnId, value: filterValue } = filter;
					console.log(columnId);
					if (columnId === 'contract_total') {
						builder.whereBetween(
							columnId,
							filterValue.map((each) => (each === '' ? 0 : parseFloat(each)))
						);
					} else {
						builder.whereRaw(`${columnId}::text iLIKE ?`, [`%${filterValue}%`]);
					}
				});
			}
		})
		.where({ deleted: false })

		.orderBy('created_on', 'desc')

		.paginate({
			perPage: size,
			currentPage: start,
			isLengthAware: true,
		});

	res.status(200).json(paginatedTable);
});

module.exports = router;
