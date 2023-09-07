const express = require('express');
const knex = require('../../01_Database/connection');
const authorize = require('../Authorization/authorization');
const { getQuotesDB } = require('../../01_Database/database');
const { format } = require('date-fns');
const router = express.Router();

router.get(`/table`, authorize(), async (req, res) => {
	const { start, size, filters, sorting, selectedQuery } = req.query;

	const parsedColumnFilters = JSON.parse(filters);
	const parsedColumnSorting = JSON.parse(sorting);
	const paredSelectedQuery = JSON.parse(selectedQuery);
	console.log(start, size);

	const paginatedTable = await knex(getQuotesDB)
		.select()
		.modify((builder) => {
			if (!!paredSelectedQuery.label) {
				const { column_name, query, user_id } = paredSelectedQuery.value;

				if (Array.isArray(query)) {
					builder.whereIn(column_name, query);
					if (user_id) builder.andWhere({ assigned_to_id: user_id });
				} else {
					builder.whereRaw(`${column_name}::text iLIKE ?`, [`%${query}%`]);
				}
			}

			if (!!parsedColumnFilters.length) {
				parsedColumnFilters.map((filter) => {
					const { id: columnId, value: filterValue } = filter;

					if (columnId === 'due_date') {
						if (!filterValue?.start && !filterValue?.finish) {
							return;
						} else if (!filterValue?.start) {
							builder.where(
								columnId,
								'<=',
								`"${format(new Date(filterValue?.finish), 'yyyy-MM-dd')}"`
							);
						} else if (!filterValue?.finish) {
							builder.where(
								columnId,
								'>=',
								`"${format(new Date(filterValue?.start), 'yyyy-MM-dd')}"`
							);
						} else {
							builder.whereBetween(columnId, [
								`"${format(new Date(filterValue?.start), 'yyyy-MM-dd')} 00:00:00"`,
								`"${format(new Date(filterValue?.finish), 'yyyy-MM-dd')} 20:00:00"`,
							]);
						}
					} else {
						if (Array.isArray(filterValue) && filterValue.length > 0) {
							builder.whereIn(columnId, filterValue);
						} else {
							builder.whereRaw(`${columnId}::text iLIKE ?`, [`%${filterValue}%`]);
						}
					}
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
