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

// /suppliers -> PATCH -> TABLE -> get all suppliers paginated
getTableRoute.getTableData(router, getSuppliersDB);

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

module.exports = router;
