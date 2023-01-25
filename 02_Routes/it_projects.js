const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');
const getTableRoute = require('./RouteCreaters/getTable');
const getRoute = require('./RouteCreaters/get');
const postRoute = require('./RouteCreaters/post');
const putRoute = require('./RouteCreaters/put');
const deleteRoute = require('./RouteCreaters/delete');

const database = require('../01_Database/database');
const getItProjectsDB = database.getItProjectsDB;
const postITProjectsDB = database.postItProjectsDB;

// /it Projects -> GET ALL

getTableRoute.getTableData(router, getItProjectsDB);

//get one
router.get('/:job_id', async (req, res) => {
	const { job_id } = req.params;
	const getData = await knex(getItProjectsDB)
		.select(
			'job_id',
			'task_name',
			'description',
			'created_by_name',
			'department',
			'completed',
			'status',
			'completed_on',
			'project_accepted',
			'admin_comment'
		)
		.where('job_id', '=', job_id);

	res.send(getData);
});

// /itpproject/:id -> post -> add one
postRoute.newEntry(router, getItProjectsDB, postITProjectsDB, new Date(), 'job_id');

// /itpproject/:id -> PUT -> edit one
putRoute.editById(router, getItProjectsDB, postITProjectsDB, new Date(), 'job_id');

deleteRoute.deleteRoute_RowRemove(router, postITProjectsDB, 'job_id');

module.exports = router;
