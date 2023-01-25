const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');

const deleteRoute = require('./RouteCreaters/delete');
const postRoute = require('./RouteCreaters/post');
const getRoute = require('./RouteCreaters/get');
const getTableRoute = require('./RouteCreaters/getTable');
const putRoute = require('./RouteCreaters/put');

const database = require('../01_Database/database');
const postPlatesDB = database.postPlatesDB;
const getPlatesDB = database.getPlatesDB;

const datefns = require('date-fns');
const today_now = datefns.format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

// /plates -> GET
router.get('/', async (req, res) => {
	const { type } = req.query;
	let getEntries;

	// ?type=active -> Get plates
	if (type == 'active') {
		getEntries = await knex(getPlatesDB).select('thickness as plate_dimensions', 'id').orderBy('sortorder', 'asc');
	}

	res.json(getEntries);
});

// /plates -> PATCH -> TABLE -> get all plates paginated
getTableRoute.getTableData(router, getPlatesDB);

// /plates -> POST -> create new plate
postRoute.newEntry(router, getPlatesDB, postPlatesDB, today_now, 'id');

// /plates/:id -> GET -> get one plate
getRoute.getById(router, getPlatesDB, 'id');

// /plates/:id -> PUT -> edit one plate
putRoute.editById(router, getPlatesDB, postPlatesDB, today_now, 'id');

// /plates/:id -> DELETE -> delete one plate
deleteRoute.deleteRoute(router, postPlatesDB, today_now, 'id');

module.exports = router;
