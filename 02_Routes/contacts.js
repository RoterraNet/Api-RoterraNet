const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');

const deleteRoute = require('./RouteCreaters/delete');
const postRoute = require('./RouteCreaters/post');
const getRoute = require('./RouteCreaters/get');
const getTableRoute = require('./RouteCreaters/getTable');
const putRoute = require('./RouteCreaters/put');

const database = require('../01_Database/database');
const postContactDB = database.postContactDB;
const getContactDB = database.getContactDB;
const getCustomerDB = database.getCustomerDB;
const getProjectsDB = database.getProjectsDB;
const getQuotesDB = database.getQuotesDB;

const datefns = require('date-fns');
const today_now = datefns.format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

// /contacts -> GET
router.get('/', async (req, res) => {
	const { customer } = req.query;
	const sql = knex(getContactDB)
		.select('contact_id', 'full_name')
		.where('deleted', '=', 0)
		.orderBy('full_name', 'asc');
	let getEntries;

	// ?customer=customer_id -> Get Contacts who work for Customer X
	if (customer) {
		getEntries = await sql.andWhere('customer', '=', customer);
	}

	res.json(getEntries);
});

router.get('/table/', async (req, res) => {
	const { start, size, filters, sorting, globalFilter } = req.query;

	const parsedColumnFilters = JSON.parse(filters);
	const parsedColumnSorting = JSON.parse(sorting);

	const paginatedTable = await knex(getContactDB)
		.select(
			'full_name',
			'contact_id',
			'sales_type_name',
			'title',
			'phone',
			'email',
			'city',
			'province'
		)
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
					builder.orderBy(columnId, sorter);
				});
			} else {
				builder.orderBy('first_name', 'asc');
			}
		})
		.where({ deleted: 0 })

		.paginate({
			perPage: size,
			currentPage: start,
			isLengthAware: true,
		});

	res.status(200).json(paginatedTable);
});

// /customer/:id/contacts  -> PATCH -> TABLE -> get quotes by that cutomer paginated

router.patch('/:id/contacts', async (req, res) => {
	const { id } = req.params;

	const getEntry = await knex(getContactDB)
		.where(`customer`, '=', id)
		.orderBy('first_name', 'asc');
	res.json(getEntry);
});

// /contacts -> PATCH -> TABLE -> get all contacts paginated
getTableRoute.getTableData(router, getContactDB);

// /contacts -> POST -> create new contact
postRoute.newEntry(router, getContactDB, postContactDB, today_now, 'contact_id');

// /contacts/:id -> GET -> get one contact
getRoute.getById(router, getContactDB, 'contact_id');

// /contacts/:id -> PUT -> edit one contact
putRoute.editById(router, getContactDB, postContactDB, today_now, 'contact_id');

// /contacts/:id -> DELETE -> delete one contact
deleteRoute.deleteRoute(router, postContactDB, today_now, 'contact_id');

// contacts/:id/project -> PATCH -> TABLE -> get projects by that contact paginated
getTableRoute.getTableData_ById(
	router,
	'project',
	getContactDB,
	'contact_id',
	getProjectsDB,
	'contact'
);

// contacts/:id/quotes  -> PATCH -> TABLE -> get quotes by that contact paginated
getTableRoute.getTableData(router, getContactDB);

router.use('/:id/contact_customers', require('./contactsCustomers'));

module.exports = router;
