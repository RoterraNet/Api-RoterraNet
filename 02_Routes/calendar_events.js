const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');

const deleteRoute = require('./RouteCreaters/delete');
const postRoute = require('./RouteCreaters/post');
const getRoute = require('./RouteCreaters/get');
const getTableRoute = require('./RouteCreaters/getTable');
const putRoute = require('./RouteCreaters/put');

const database = require('../01_Database/database');

const getInAndOutDB = database.getInAndOutDB;
const postInAndOutDB = database.postInAndOutDB;

const getCalendarCategoriesDB = database.getCalendarCategoriesDB;

const datefns = require('date-fns');

const today_now = datefns.format(new Date(), "yyyy-MM-dd'T'HH:MM:ssxxx");
const today_date = datefns.format(new Date(), 'yyyy-MM-dd');
const oneWeekFromToday_now = datefns.add(new Date(today_date), { weeks: 1 });

const oneYearFromNow = datefns.add(new Date(), { months: 3 });
const oneYearAgoFromNow = datefns.sub(new Date(), { months: 3 });

// /calendarevent/current' -> GET
/* GETS ALL IN and OUT Data ---
that has a RETURN_DATE that has NOT been past todays date
and a DATE (leaving date) that has yet to come */
router.get('/current', async (req, res) => {
	const rawData = knex.raw(
		"date at time zone 'MST' as date, return_date at time zone 'MST' as return_date, id, description, location, start_time, end_time, created_by, category, user_id, created_by_name, event_name, category_name"
	);
	const getInAndOut = await knex(getInAndOutDB)
		.select(rawData)
		.where(
			knex.raw(
				"return_date >= now() + interval '-1 hours' AND current_date + interval '23 hours' >= date"
			)
		)

		.orderBy('return_date', 'asc');
	res.json(getInAndOut);
});

// /calendarevent' -> GET
/* GETS ALL IN and OUT Data ---
that has a DATE (leaving Date) that has yet to come 
but within 1 week of todays date */
router.get('/', async (req, res) => {
	const rawData = knex.raw(
		"date at time zone 'MST' as date, return_date at time zone 'MST' as return_date, id, description, location, start_time, end_time, created_by, category, user_id, created_by_name, event_name, category_name"
	);
	const getInAndOut = await knex(getInAndOutDB)
		.select(rawData)
		.where(
			knex.raw(
				"date > current_date + interval '23 hours' AND date BETWEEN now() AND current_date + interval '1 week'"
			)
		)

		.orderBy('date', 'asc');
	res.send(getInAndOut);
});

// postRoute.newEntry(router, getInAndOutDB, postInAndOutDB, today_now, 'event_name');

router.post('/', async (req, res) => {
	console.log('here');
	const { user_id, values } = req.body;

	const checkDateValues = (reqValues) => {
		const newArrayOfDates = [];
		if (
			datefns.format(new Date(reqValues.date), 'yyyy-MM-dd') !==
			datefns.format(new Date(reqValues.return_date), 'yyyy-MM-dd')
		) {
			for (
				dt = new Date(reqValues.date);
				dt <= new Date(reqValues.return_date);
				dt.setDate(dt.getDate() + 1)
			) {
				newArrayOfDates.push({
					...reqValues,
					date: datefns.format(new Date(dt), 'yyyy-MM-dd 08:00'),
					return_date: datefns.format(new Date(dt), 'yyyy-MM-dd 16:30'),
				});
			}
		} else {
			newArrayOfDates.push({ ...reqValues });
		}
		if (newArrayOfDates.length > 1) {
			newArrayOfDates[0] = {
				...newArrayOfDates[0],
				date: datefns.format(new Date(reqValues.date), 'yyyy-MM-dd HH:mm'),
				return_date: datefns.format(new Date(reqValues.date), 'yyyy-MM-dd 16:30'),
			};

			newArrayOfDates[newArrayOfDates.length - 1] = {
				...newArrayOfDates[newArrayOfDates.length - 1],
				return_date: datefns.format(new Date(reqValues.return_date), 'yyyy-MM-dd HH:mm'),
			};
		}
		return newArrayOfDates;
	};

	const fieldsToInsert = checkDateValues(values).map((field) => {
		return field;
	});
	const getInAndOut = await knex(postInAndOutDB).insert(fieldsToInsert).returning('*');
	console.log(getInAndOut);
	try {
	} catch (error) {
		console.log(error);
	}

	res.send('getInAndOut');
});

// /calendarevent/:id -> DELETE -> delete one Event
deleteRoute.deleteRoute_RowRemove(router, postInAndOutDB, today_now, 'id');

putRoute.editById(router, getInAndOutDB, postInAndOutDB, today_now, 'id');

// /calendarevent/categories' -> GET
// GETS the list of catergories for dropdown menu
router.get('/categories', async (req, res) => {
	const getCategories = await knex(getCalendarCategoriesDB);
	res.json(getCategories);
});

//  GETS ALL DATA FROM TABLE AND CONVERTS NAMES TO ALLOW CALENDER TO BE USED
router.get('/all', async (req, res) => {
	const { start, end } = req.query;

	try {
		const query = knex.raw(
			"id, created_by,user_id, date at time zone 'MST' AS start, return_date at time zone 'MST' AS end, category_name, category, location, description, CASE WHEN category = 1 THEN CASE WHEN location = '' THEN description WHEN description = '' THEN location ELSE CONCAT(description, ' - ',location) END ELSE event_name END title, CASE WHEN location = '' THEN description WHEN description = '' THEN location ELSE CONCAT(description, ' - ',location) END detail,  CASE WHEN category = 1 THEN '#2e7d32' WHEN category = 2 THEN '#d32f2f' WHEN category = 3 THEN '#9c27b0' WHEN category = 4 THEN '#ed6c02' END color"
		);
		const getInAndOut = await knex(getInAndOutDB)
			.select(query)
			.whereBetween('date', [start, end])
			.orderBy('id', 'desc');

		res.send(getInAndOut);
	} catch (error) {
		console.log('error', error);
	}
});

router.get('/:id', async (req, res) => {
	const { id } = req.params;
	const getOne = await knex(getInAndOutDB).where({ id: id });
	res.json(getOne);
});

module.exports = router;
