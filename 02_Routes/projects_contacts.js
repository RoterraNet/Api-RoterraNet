const express = require('express');
const router = express.Router({ mergeParams: true });

const knex = require('../01_Database/connection');
const database = require('../01_Database/database');

const getProjectsDB = database.getProjectsDB;

const getProjectsContactsDB = database.getProjectsContactsDB;
const postProjectsContactsDB = database.postProjectsContactsDB;

const deleteRoute = require('./RouteCreaters/delete');
const postRoute = require('./RouteCreaters/post');
const putRoute = require('./RouteCreaters/put');
const datefns = require('date-fns');
const { andWhere } = require('../01_Database/connection');

const today_now = datefns.format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

// /projects/:id/projects_contacts => Get All
router.get('/', async (req, res) => {
	const { id } = req.params;

	const getEntry = await knex(getProjectsDB)
		.select(`${getProjectsContactsDB}.*`)
		.where(`${getProjectsDB}.id`, '=', id)
		.andWhere(`${getProjectsContactsDB}.deleted`, '=', 0)
		.leftJoin(
			getProjectsContactsDB,
			`${getProjectsDB}.id`,
			'=',
			`${getProjectsContactsDB}.project_id`
		)
		.orderBy('customer_name', 'asc');

	res.json(getEntry);
});

// /projects/:id/projects_contacts => Add
postRoute.newEntry(
	router,
	getProjectsContactsDB,
	postProjectsContactsDB,
	today_now,
	'project_contact_id'
);

// /projects/:id/projects_contacts/:id2 => Edit
putRoute.editById(
	router,
	getProjectsContactsDB,
	postProjectsContactsDB,
	today_now,
	'project_contact_id'
);

// /projects/:id/projects_contacts/:id2 => Delete
deleteRoute.deleteRoute(router, postProjectsContactsDB, today_now, 'project_contact_id');

module.exports = router;
