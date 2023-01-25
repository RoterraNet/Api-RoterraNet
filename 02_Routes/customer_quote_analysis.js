const express = require('express');
const Knex = require('knex');

const router = express.Router();
const knex = require('../01_Database/connection');
const { getQuotesDB } = require('../01_Database/database');

router.get('/analysis', async (req, res) => {
	const { start, finish, customer_id } = JSON.parse(req.query.search);

	const rawSql = knex.raw(
		`extract(year from created_on)  as year,  sum("est_total_value") as "total_bid" , sum("est_total_value") as "total_bid" ,  count('*') as bids`
	);
	const yearBids = await knex(getQuotesDB)
		.select(rawSql)
		.where({
			deleted: 0,
			customer_id: customer_id,
		})
		.groupBy('year')
		.orderBy('year', 'desc');

	const wonBidRawSql = knex.raw(
		`extract(year from created_on)  as year,  sum("won_value") as "won_value" ,  count('*') as won_bids`
	);

	const wonBid = await knex(getQuotesDB)
		.select(wonBidRawSql)
		.where({
			deleted: 0,
			customer_id: customer_id,
			status: 1,
		})
		.orWhere({ deleted: 0, customer_id: customer_id, status: 6 })
		.groupBy('year')
		.orderBy('year', 'desc');

	res.send(sortArray(yearBids, wonBid));
});

const sortArray = (arrayOne, arrayTwo) => {
	const newArray = [];
	arrayOne.forEach((eachOne) => {
		arrayTwo.forEach((eachTwo) => {
			eachOne.year === eachTwo.year &&
				newArray.push({
					...eachOne,
					...eachTwo,
					wonValuePercent: (
						(parseInt(eachTwo.won_value || 0) / parseInt(eachOne.total_bid || 0)) *
						100
					).toFixed(2),
					wonCountPercent: (
						(parseInt(eachTwo.won_bids || 0) / parseInt(eachOne.bids || 0)) *
						100
					).toFixed(2),
				});
		});
	});
	return newArray;
};

module.exports = router;
