const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');
const datefns = require('date-fns');

const deleteRoute = require('./RouteCreaters/delete');
const postRoute = require('./RouteCreaters/post');
const getRoute = require('./RouteCreaters/get');
const getTableRoute = require('./RouteCreaters/getTable');
const putRoute = require('./RouteCreaters/put');

const database = require('../01_Database/database');
const getUsersCoursesDB = database.getUsersCoursesDB;
const postUsersCoursesDB = database.postUsersCoursesDB;

const today_now = datefns.format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

// // /users_courses -> GET ALL
router.get('/', async (req, res) => {
	const { user_id } = req.query;
	let getEntries;
	if (user_id) {
		getEntries = await knex(getUsersCoursesDB).select('*').where('deleted', '=', 0).where('user_id', '=', user_id).orderBy('course_name', 'asc');
	} else {
		getEntries = await knex(getUsersCoursesDB).select('*').where('deleted', '=', 0).orderBy('course_name', 'asc');
	}

	res.json(getEntries);
});

// /user_courses -> PATCH -> TABLE -> get all users paginated
getTableRoute.getTableData(router, getUsersCoursesDB);

// /user_courses -> POST -> create user
postRoute.newEntry(router, getUsersCoursesDB, postUsersCoursesDB, today_now, 'user_course_id');

// /user_courses/:id -> GET -> get one user
getRoute.getById(router, getUsersCoursesDB, 'user_course_id');

// /user_courses/:id -> PUT -> edit one user
putRoute.editById(router, getUsersCoursesDB, postUsersCoursesDB, today_now, 'user_course_id');

// /user_courses/:id -> DELETE -> delete one supplier
deleteRoute.deleteRoute(router, postUsersCoursesDB, today_now, 'user_course_id');

module.exports = router;
