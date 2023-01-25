const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');
const deleteRoute = require('./RouteCreaters/delete');
const postRoute = require('./RouteCreaters/post');
const { getNewsDB, postNewsDB } = require('../01_Database/database');

const datefns = require('date-fns');

const today_now = datefns.format(new Date(), "yyyy-MM-dd'T'HH:MM:ssxxx");

router.get('/', async (req, res) => {
	const getNews = await knex(getNewsDB).orderBy('created_on', 'DESC').limit(10);
	res.json(getNews);
});

postRoute.newEntry(router, getNewsDB, postNewsDB, today_now, 'news_id');

deleteRoute.deleteRoute_RowRemove(router, postNewsDB, today_now, 'news_id');

module.exports = router;
