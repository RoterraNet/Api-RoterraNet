const express = require('express');
const router = express.Router();
const axios = require('axios');
const qs = require('qs');
const { getQuotesGraphApiDB, getProjectsGraphApiDB } = require('../01_Database/database');
const knex = require('../01_Database/connection');
/**
 * Function that Gets token from Graph api.
 * @author   Hasan Alghanim
 * @data     {Object}  	  		Information for our registered graph api app
 * @return   {String}         	Access token
 * GET => /graphapi
 */
router.get('/', async (req, res) => {
	const url = `https://login.microsoftonline.com/${process.env.GRAPH_API_TENANT_ID}/oauth2/v2.0/token`;
	const data = {
		client_id: process.env.GRAPH_API_CLIENT_ID,
		scope: process.env.GRAPH_API_SCOPE,
		client_secret: process.env.GRAPH_API_CLIENT_SECRET_KEY,
		grant_type: process.env.GRAPH_API_GRANT_TYPE,
	};
	const options = {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		data: qs.stringify(data),
		url,
	};

	await axios(options)
		.then((graphRes) => res.status(200).send(graphRes.data.access_token))
		.catch((error) => {
			console.log(error);
			res.status(500).json(error);
		});
});

router.get('/site_id', async (req, res) => {
	const { quote_id } = req.query;
	const getSiteId = await knex(getQuotesGraphApiDB)
		.where('start_id', '<=', quote_id)
		.andWhere('end_id', '>=', quote_id);
	res.json(getSiteId);
});

router.get('/site_id/quotes', async (req, res) => {
	const { quote_id } = req.query;
	const getSiteId = await knex(getQuotesGraphApiDB)
		.where('start_id', '<=', quote_id)
		.andWhere('end_id', '>=', quote_id);
	res.json(getSiteId);
});

router.get('/site_id/projects', async (req, res) => {
	const { quote_id } = req.query;

	const getSiteId = await knex(getProjectsGraphApiDB)
		.where('start_id', '<=', quote_id)
		.andWhere('end_id', '>=', quote_id);
	res.json(getSiteId);
});

module.exports = router;
