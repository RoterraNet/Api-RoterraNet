const express = require('express');
const router = express.Router();
const database = require('../../../01_Database/database');
const knex = require('../../../01_Database/connection');
const { format } = require('date-fns');
const SearchBuilder = require('../../RouteCreaters/RouteHelpers/SearchBuilder');
const getWorkordersItemsDetailsDB = database.getWorkordersItemsDetailsDB;

// router.get(`/table`, async (req, res) => {
// 	const page = req.query.page;
// 	const perPage = req.query.perPage;

// 	const search = Object.keys(JSON.parse(req.query.search));
// 	const newArrayCleaned = [];

// 	search.map((each) => {
// 		const parsedObj = JSON.parse(req.query.search)[each];
// 		parsedObj.filterBy !== '' && newArrayCleaned.push(parsedObj);
// 	});

// 	console.log(newArrayCleaned);
// 	const paginatedTable = await knex(getWorkordersItemsDetailsDB)
// 		.select(
// 			'workorder_item_detail_name',
// 			'pipe_approved_on',
// 			'pipe_approved_name',
// 			'pipe_od',
// 			'pipe_wall',
// 			'pipe_length',
// 			'helix_1_thickness',
// 			'helix_2_thickness',
// 			'helix_4_thickness',
// 			'helix_4_thickness',
// 			'helix_1_diameter',
// 			'helix_2_diameter',
// 			'helix_4_diameter',
// 			'helix_4_diameter'
// 		)
// 		.modify((builder) => {
// 			SearchBuilder(newArrayCleaned, builder);
// 		})
// 		.whereNotNull('pipe_approved_on')
// 		.orderBy('pipe_approved_on', 'desc')

// 		.paginate({
// 			perPage: perPage,
// 			currentPage: page,
// 			isLengthAware: true,
// 		});

// 	res.json(paginatedTable);
// });

router.get(`/table`, async (req, res) => {
	const { start, size, filters, sorting, globalFilter } = req.query;

	const parsedColumnSorting = JSON.parse(sorting);
	const parsedColumnFilters = JSON.parse(filters);
	const paginatedTable = await knex(getWorkordersItemsDetailsDB)
		.select(
			'workorder_item_detail_id',
			'workorder_item_detail_name',
			'pipe_approved_on',
			'pipe_approved_name',
			'pipe_od',
			'pipe_wall',
			'pipe_length',
			'helix_1_thickness',
			'helix_2_thickness',
			'helix_4_thickness',
			'helix_4_thickness',
			'helix_1_diameter',
			'helix_2_diameter',
			'helix_4_diameter',
			'helix_4_diameter',
			'workorder_item_description'
		)
		.whereNotNull('pipe_approved_on')
		.modify((builder) => {
			if (!!parsedColumnFilters?.length) {
				parsedColumnFilters.map((filter) => {
					const { id: columnId, value: filterValue } = filter;
					if (columnId === 'pipe_approved_on') {
						if (!filterValue?.start && !filterValue?.finish) {
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
						builder.whereRaw(`${columnId}::text iLIKE ?`, [`%${filterValue}%`]);
					}
				});
			}
		})
		.orderBy('pipe_approved_on', 'desc')
		.paginate({
			perPage: size,
			currentPage: start,
			isLengthAware: true,
		});

	if (!!parsedColumnSorting?.length) {
		const sort = parsedColumnSorting[0];
		const { id, desc } = sort;
		paginatedTable.data.sort((a, b) => {
			if (desc) {
				return a[id] < b[id] ? 1 : -1;
			}
			return a[id] > b[id] ? 1 : -1;
		});
	}

	res.status(200).json(paginatedTable);
});

router.get('/stats/', async (req, res) => {
	const { id } = req.params;
	const raw = knex.raw('DISTINCT pipe_approved_on::date');

	const allDates = await knex(getWorkordersItemsDetailsDB)
		.select(raw)
		.whereBetween('pipe_approved_on', ['2023-01-15', '2023-02-20']);

	const allWorkorders = await knex(getWorkordersItemsDetailsDB)
		.select('workorder_item_detail_name', 'pipe_approved_on')
		.whereBetween('pipe_approved_on', ['2023-01-15', '2023-02-20']);

	allDates.map((date) => {
		date.workorders = [];

		allWorkorders.map((workorderItems) => {
			format(new Date(workorderItems.pipe_approved_on), 'LLL-dd-yyyy') ===
				format(new Date(date.pipe_approved_on), 'LLL-dd-yyyy') &&
				date.workorders.push(workorderItems);
		});
	});

	res.json(allDates);
});

module.exports = router;
