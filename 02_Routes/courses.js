const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');
const datefns = require('date-fns');

const deleteRoute = require('./RouteCreaters/delete');
const postRoute = require('./RouteCreaters/post');
const getRoute = require('./RouteCreaters/get');
const getTableRoute = require('./RouteCreaters/getTable');
const putRoute = require('./RouteCreaters/put');

const today_now = datefns.format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

const database = require('../01_Database/database');
const getCoursesDB = database.getCoursesDB;
const postCoursesDB = database.getCoursesDB;

// /Departments -> GET ALL
router.get('/', async (req, res) => {
	const getEntries = await knex(getCoursesDB).select('*').orderBy('course_name', 'asc');

	res.json(getEntries);
});

// /user_courses -> PATCH -> TABLE -> get all users paginated
getTableRoute.getTableData(router, getCoursesDB);

// /user_courses -> POST -> create user
postRoute.newEntry(router, getCoursesDB, postCoursesDB, today_now, 'course_id');

// /user_courses/:id -> GET -> get one user
getRoute.getById(router, getCoursesDB, 'course_id');

// /user_courses/:id -> PUT -> edit one user
putRoute.editById(router, getCoursesDB, postCoursesDB, today_now, 'course_id');

module.exports = router;
