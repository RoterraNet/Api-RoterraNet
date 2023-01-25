const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');

const deleteRoute = require('./RouteCreaters/delete');
const postRoute = require('./RouteCreaters/post');
const getRoute = require('./RouteCreaters/get');
const getTableRoute = require('./RouteCreaters/getTable');
const putRoute = require('./RouteCreaters/put');

const database = require('../01_Database/database');
const postPipesDB = database.postPipesDB;
const getPipesDB = database.getPipesDB;

const datefns = require('date-fns');
const today_now = datefns.format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

// /pipes -> GET
router.get('/', async (req, res) => {
	const { type } = req.query;
	let getEntries;

	// ?type=active -> Get pipes
	if (type == 'active') {
		getEntries = await knex.raw(`select od || ' (' || wall || ')' as pipe_dimensions, id from ${getPipesDB} order by stocked_sizes desc, od_decimal`);
		getEntries = getEntries.rows;
	}

	res.json(getEntries);
});

// /pipes -> PATCH -> TABLE -> get all pipes paginated
getTableRoute.getTableData(router, getPipesDB);

// /pipes -> POST -> create new pipe
postRoute.newEntry(router, getPipesDB, postPipesDB, today_now, 'id');

// /pipes/:id -> GET -> get one pipe
getRoute.getById(router, getPipesDB, 'id');

// /pipes/:id -> PUT -> edit one pipe
putRoute.editById(router, getPipesDB, postPipesDB, today_now, 'id');

// /pipes/:id -> DELETE -> delete one pipe
deleteRoute.deleteRoute(router, postPipesDB, today_now, 'id');

module.exports = router;
