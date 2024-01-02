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
const authorize = require('./Authorization/authorization');
const today_now = datefns.format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

// /pipes -> GET
router.get('/', async (req, res) => {
	const { type } = req.query;
	let getEntries;

	// ?type=active -> Get pipes
	if (type == 'active') {
		getEntries = await knex.raw(
			`select od || ' (' || wall || ')' as pipe_dimensions, id from ${getPipesDB} order by stocked_sizes desc, od_decimal`
		);
		getEntries = getEntries.rows;
	}

	res.json(getEntries);
});

router.get(`/table`, authorize(), async (req, res) => {
	const { start, size, filters, sorting, globalFilter } = req.query;

	const parsedColumnFilters = JSON.parse(filters);
	const parsedColumnSorting = JSON.parse(sorting);

	const paginatedTable = await knex(getPipesDB)
		.select('*')
		.modify((builder) => {
			if (!!parsedColumnFilters.length) {
				parsedColumnFilters.map((filter) => {
					const { id: columnId, value: filterValue } = filter;
					console.log(columnId);

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
				builder.orderBy('id', 'desc');
			}
		})

		.paginate({
			perPage: size,
			currentPage: start,
			isLengthAware: true,
		});

	res.status(200).json(paginatedTable);
});

router.get('/autoGen/:id', async (req, res) => {
	try {
		const { id } = req.params;

		const raw = knex.raw(`od || ' (' || wall || ')' as pipe_dimensions`);
		const getPipe = await knex(getPipesDB).select('*', raw).where({ id: id });

		res.json(getPipe);
	} catch (error) {
		console.log(error);
		res.json({ msg: 'error', error: error });
	}
});

router.post('/checkDriveHoles/', async (req, res) => {
	try {
		const { pipe_id, driveholesize, driveholespacing1, driveholespacing2, driveholespacing3 } =
			req.body;

		const getPipe = await knex(getPipesDB).where({ id: pipe_id });
		const pipe_data = getPipe[0];

		console.log({
			pipe_id,
			driveholesize,
			driveholespacing1,
			driveholespacing2,
			driveholespacing3,
		});

		console.log(pipe_data);
		if (
			driveholesize === pipe_data.drive_hole_size &&
			driveholespacing1 === pipe_data.drive_hole_spacing_1 &&
			driveholespacing2 === pipe_data.drive_hole_spacing_2 &&
			driveholespacing3 === pipe_data.drive_hole_spacing_3
		) {
			res.json({ roterra_pipe: true });
		} else {
			res.json({ roterra_pipe: false });
		}
	} catch (error) {
		console.log(error);
		res.json({ msg: 'error', error: error });
	}
});

router.post(`/addPipe`, authorize(), async (req, res) => {
	const body = req.body;

	try {
		const newPipe = await knex(postPipesDB).insert({ ...body });

		res.status(200).json({ msg: 'New Pipe Size Added' });
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: error, msg: 'Check the Error' });
	}
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
