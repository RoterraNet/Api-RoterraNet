const express = require('express');
const router = express.Router({ mergeParams: true });
const knex = require('../01_Database/connection');
const database = require('../01_Database/database');

const getNotesDB = database.getNotesDB;
const postNotesDB = database.postNotesDB;

const deleteRoute = require('./RouteCreaters/delete');
const postRoute = require('./RouteCreaters/post');
const putRoute = require('./RouteCreaters/put');
const datefns = require('date-fns');

const today_now = datefns.format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

// /projects/:id/projects_notes => Get All
router.get('/', async (req, res) => {
	const { id } = req.params;
	const getEntry = await knex(getNotesDB).select('*').where(`project_id`, '=', id).andWhere('deleted', '=', '0').orderBy('created_on', 'desc');

	res.json(getEntry);
});

// /projects/:id/projects_notes => ADD
postRoute.newEntry(router, getNotesDB, postNotesDB, today_now, 'note_id');

// /projects/:id/projects_notes/:id2 => Edit
putRoute.editById(router, getNotesDB, postNotesDB, today_now, 'note_id');

// /projects/:id/projects_notes/:id2 => Delete
deleteRoute.deleteRoute(router, postNotesDB, today_now, 'note_id');

module.exports = router;
