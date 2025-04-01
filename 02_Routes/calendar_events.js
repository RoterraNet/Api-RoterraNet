const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');

const deleteRoute = require('./RouteCreaters/delete');

const putRoute = require('./RouteCreaters/put');

const database = require('../01_Database/database');

const getInAndOutDB = database.getInAndOutDB;
const postInAndOutDB = database.postInAndOutDB;

const getCalendarCategoriesDB = database.getCalendarCategoriesDB;

const datefns = require('date-fns');

const today_now = datefns.format(new Date(), "yyyy-MM-dd'T'HH:MM:ssxxx");
const today_date = datefns.format(new Date(), 'yyyy-MM-dd');

// /calendarevent/current' -> GET
/* GETS ALL IN and OUT Data ---
that has a RETURN_DATE that has NOT been past todays date
and a DATE (leaving date) that has yet to come */
router.get('/current', async (req, res) => {
	const getInAndOut = await knex(getInAndOutDB)
		.select('*')
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
	const getInAndOut = await knex(getInAndOutDB)
		.select('*')
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

	// const fieldsToInsert = checkDateValues(values).map((field) => {
	// 	return field;
	// });
	const postInAndOut = await knex(postInAndOutDB).insert(values).returning('*');
	console.log(postInAndOut);
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
	try {
		const deleted = req.query;
		console.log(deleted);
		const getCategories = await knex(getCalendarCategoriesDB).where({ deleted: deleted });
		res.json(getCategories);
	} catch (error) {
		console.log(error);
		res.json({ msg: 'Something went wrong', error: error });
	}
});

//  GETS ALL DATA FROM TABLE AND CONVERTS NAMES TO ALLOW CALENDER TO BE USED
router.get('/all', async (req, res) => {
	const { start, end, location } = req.query;

	try {
		const query = knex.raw(
			`CASE WHEN category = 1 THEN 
				CASE 
					WHEN location = '' THEN description 
					WHEN description = '' THEN location 
					ELSE CONCAT(description, ' - ', location) 
				END 
			 ELSE event_name 
			 END AS title, 
			 CASE 
				WHEN location = '' THEN description 
				WHEN description = '' THEN location 
				ELSE CONCAT(description, ' - ', location) 
			 END AS detail`
		);

		const getInAndOut = await knex(getInAndOutDB)
			.select(
				query,
				'color',
				'id',
				'user_id',
				'created_by',
				'date as start',
				'return_date as end',
				'date as go_date',
				'return_date',
				'category_name',
				'category',
				'location',
				'location_id',
				'description',
				'sub_category_name',
				'sub_category_id'
			)
			.where('date', '<=', end)
			.andWhere('return_date', '>=', start)
			.andWhere((builder) => {
				if (location !== 'all') {
					builder.where({ category: 1 }).orWhere((qb) => {
						qb.where({ location_id: location });
					});
				}
			})
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

router.get('/calendarLocations/123', async (req, res) => {
	const calendarLocations = await knex(database.postCalendarLocationsDB)
		.select('id', 'location_name')
		.where({
			deleted: false,
		});
	res.json(calendarLocations);
});

module.exports = router;
