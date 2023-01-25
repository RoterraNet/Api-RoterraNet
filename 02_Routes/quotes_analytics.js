const express = require('express');
const { each } = require('lodash');
const router = express.Router({ mergeParams: true });

const knex = require('../01_Database/connection');
const database = require('../01_Database/database');
const getTableRoute = require('./RouteCreaters/getTable');

const getQuotesAnalyticsDB = database.getQuotesAnalyticsDB;
const SearchBuilder = require('./RouteCreaters/RouteHelpers/SearchBuilder');

// /quotes/:id/quotes_customer => Get All
router.get('/', async (req, res) => {
	console.log(JSON.parse(req.query.search));

	const searchQuery = JSON.parse(req.query.search);
	const userSearch = [...searchQuery.deletedUsers];
	for (const [key, value] of Object.entries(searchQuery)) {
		value === true && userSearch.push(key);
	}

	console.log(userSearch);

	const getEntry = await knex(getQuotesAnalyticsDB)
		.select('category', 'assigned_to_id', 'assigned_to_name')
		.sum({ total_value: 'est_total_value' })
		.whereBetween('created_on', [searchQuery.start, searchQuery.finish])
		.modify((builder) => {
			if (userSearch.length) {
				builder.whereIn('assigned_to_id', userSearch);
			}
		})
		// .where({ customer_id: 27 })
		.groupBy(
			'view_quotes_analysis.category',
			'view_quotes_analysis.assigned_to_id',
			'view_quotes_analysis.assigned_to_name'
		);

	const counts = await knex(getQuotesAnalyticsDB)
		.select('category', 'assigned_to_id', 'assigned_to_name')
		.count('category')
		.whereBetween('created_on', [searchQuery.start, searchQuery.finish])
		.modify((builder) => {
			if (userSearch.length) {
				builder.whereIn('assigned_to_id', userSearch);
			}
		})
		// .where({ customer_id: 27 })
		.groupBy(
			'view_quotes_analysis.category',
			'view_quotes_analysis.assigned_to_id',
			'view_quotes_analysis.assigned_to_name'
		)
		.orderBy('count', 'asc');

	const sql = knex.raw(
		`TO_CHAR(DATE_TRUNC('month',created_on), 'Mon-YY') as month, COUNT(quote_id) as count`
	);

	const monthStats = await knex(getQuotesAnalyticsDB)
		.select(sql)
		.groupByRaw(`DATE_TRUNC('month', created_on)`)
		.whereBetween('created_on', [searchQuery.start, searchQuery.finish])
		.modify((builder) => {
			if (userSearch.length) {
				builder.whereIn('assigned_to_id', userSearch);
			}
		})
		// .where({ customer_id: 27 })
		.orderByRaw(`DATE_TRUNC('month',created_on)`);

	const deletedArray = [];
	const notBid = [];
	const unknownArray = [];
	const wonArray = [];
	const lostArray = [];

	const sort = (a, b) => {
		if (a.file_name < b.file_name) {
			return -1;
		}
		if (a.file_name > b.file_name) {
			return 1;
		}
		return 0;
	};

	sortedData = getEntry.sort(sort);

	sortedData.map((each) => {
		if (each.category === 0) deletedArray.push(each);
		if (each.category === 1) notBid.push(each);
		if (each.category === 9) unknownArray.push(each);
		if (each.category === 2) wonArray.push(each);
		if (each.category === 3) lostArray.push(each);
	});

	const deletedArrayCount = [];
	const notBidCount = [];
	const unknownArrayCount = [];
	const wonArrayCount = [];
	const lostArrayCount = [];

	counts.map((each) => {
		if (each.category === 0) {
			deletedArrayCount.push(each);
		}
		if (each.category === 1) {
			notBidCount.push(each);
		}
		if (each.category === 9) {
			unknownArrayCount.push(each);
		}
		if (each.category === 2) {
			wonArrayCount.push(each);
		}
		if (each.category === 3) {
			lostArrayCount.push(each);
		}
	});

	res.json({
		deletedArray,
		notBid,
		unknownArray,
		wonArray,
		lostArray,
		deletedArrayCount,
		notBidCount,
		unknownArrayCount,
		wonArrayCount,
		lostArrayCount,
		monthStats,
	});
});

router.get('/getQuoteUsers', async (req, res) => {
	const getUsers = await knex(getQuotesAnalyticsDB)
		.select('assigned_to_id', 'assigned_to_name', 'user_deleted')

		.groupBy(
			'view_quotes_analysis.assigned_to_id',
			'view_quotes_analysis.assigned_to_name',
			'view_quotes_analysis.user_deleted'
		)
		.orderBy('assigned_to_name', 'asc');

	const deletedUsersList = [];
	const activeUsersList = [];

	getUsers.map((eachUser) => {
		eachUser.user_deleted === 0 && activeUsersList.push(eachUser);
		eachUser.user_deleted === 1 && deletedUsersList.push(eachUser);
	});
	res.json({ deletedUsersList: deletedUsersList, activeUsersList: activeUsersList });
});
module.exports = router;
