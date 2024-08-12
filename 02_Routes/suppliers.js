const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');

const deleteRoute = require('./RouteCreaters/delete');
const postRoute = require('./RouteCreaters/post');
const getRoute = require('./RouteCreaters/get');
const getTableRoute = require('./RouteCreaters/getTable');
const putRoute = require('./RouteCreaters/put');

const database = require('../01_Database/database');
const postSuppliersDB = database.postSuppliersDB;

const getSuppliersDB = database.getSuppliersDB;

const getPoDB = database.getSuppliersDB;

const datefns = require('date-fns');
const today_now = datefns.format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

// /suppliers -> GET
router.get('/', async (req, res) => {
	const { type } = req.query;
	let getEntries;

	// ?type=active -> Get suppliers who are not deleted
	if (type == 'active') {
		getEntries = await knex(getSuppliersDB)
			.select('name', 'supplier_id')
			.where('deleted', '=', 0)
			.distinctOn('name')
			.orderBy('name', 'asc');
	}
	res.json(getEntries);
});

router.get(`/table`, async (req, res) => {
	const { start, size, filters, sorting } = req.query;

	const parsedColumnFilters = JSON.parse(filters);
	const parsedColumnSorting = JSON.parse(sorting);

	const paginatedTable = await knex(getSuppliersDB)
		.select(
			'supplier_id',
			'status',
			'name',
			'phone',
			'email',
			'class',
			'status_name',
			'status_bg_color'
		)
		.modify((builder) => {
			if (!!parsedColumnFilters.length) {
				parsedColumnFilters.map((filter) => {
					const { id: columnId, value: filterValue } = filter;

					if (Array.isArray(filterValue) && filterValue.length > 0) {
						builder.whereIn(columnId, filterValue);
					} else {
						builder.whereRaw(`${columnId}::text iLIKE ?`, [`%${filterValue}%`]);
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
				builder.orderBy('name', 'asc');
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

// /suppliers -> GET
router.get('/approved_suppliers', async (req, res) => {
	getEntries = await knex(getSuppliersDB)
		.select('name', 'supplier_id')
		.where('deleted', '=', 0)
		.andWhere({ status: 2 })
		.distinctOn('name')
		.orderBy('name', 'asc');

	res.json(getEntries);
});

// /suppliers -> PATCH -> TABLE -> get all suppliers paginated
getTableRoute.getTableData(router, getSuppliersDB);

router.put('/updateSupplier', async (req, res) => {
	const { id, update } = req.body;
	try {
		const postSupplier = await knex(postSuppliersDB).update(update).where({ supplier_id: id });
		console.log(id, update);
		res.json('...');
	} catch (e) {
		res.status = 500;
		res.json({ error: e, msg: 'Something went wrong. Check Error' });
	}
});

// /suppliers -> POST -> create new supplier

router.post('/', async (req, res) => {
	const { values } = req.body;
	try {
		const postSupplier = await knex(postSuppliersDB)
			.insert({
				address: values.address,
				address2: values.address2,
				city: values.city,
				class: values.class,
				country: values.country,
				created_by: values.created_by,
				created_on: values.created_on,
				email: values.email,
				fax: values.fax,
				name: values.name,
				phone: values.phone,
				postal_code: values.post_code,
				province: values.province,
				website: values.website,
			})
			.returning('supplier_id');
		res.status = 202;
		res.json({ msg: 'Supplier was created', supplier_id: postSupplier[0] });
	} catch (e) {
		res.status = 500;
		res.json({ error: e, msg: 'Something went wrong. Check Error' });
	}
});

// /suppliers/:id -> GET -> get one supplier
getRoute.getById(router, getSuppliersDB, 'supplier_id');

// /suppliers/:id -> PUT -> edit one supplier
putRoute.editById(router, getSuppliersDB, postSuppliersDB, today_now, 'supplier_id');

// /suppliers/:id -> DELETE -> delete one supplier
deleteRoute.deleteRoute(router, postSuppliersDB, today_now, 'supplier_id');

// router.post('/consolidate', async (req, res) => {
// 	const { values } = req.body;
// 	console.log(values);
// 	try {
// 		const mainSupplierId = values[0];
// 		const secondSupplierId = values[1];

// 		await knex(database.postPoDB)
// 			.update({ supplier: mainSupplierId })
// 			.where({ supplier: secondSupplierId });
// 		const updateSupplier = await knex(postSuppliersDB)
// 			.update({
// 				deleted: 1,
// 				deleted_by: 614,
// 				deleted_on: new Date(),
// 				status: 2,
// 			})
// 			.where({ supplier_id: secondSupplierId });

// 		console.log('consolidate supplier');
// 		res.status = 202;
// 		res.json({ msg: 'consolidated' });
// 	} catch (e) {
// 		res.status = 500;
// 		console.log(e);
// 		res.json({ error: e, msg: 'Something went wrong. Check Error' });
// 	}
// });

module.exports = router;
