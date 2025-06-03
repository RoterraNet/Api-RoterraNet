const express = require('express');

const router = express.Router();
const knex = require('../01_Database/connection');
const { getQuotesDB } = require('../01_Database/database');

router.get('/analysis', async (req, res) => {
	const { customer_id } = JSON.parse(req.query.search);

	// Total Bids per Year
	const rawSql = knex.raw(`
		extract(year from created_on) as year, 
		sum("est_total_value") as "total_bid",  
		count(*) as bids
	`);

	const yearBids = await knex(getQuotesDB)
		.select(rawSql)
		.where({
			deleted: 0,
			customer_id: customer_id,
		})
		.groupBy('year')
		.orderBy('year', 'desc');

	// Won Bids per Year
	const wonBidRawSql = knex.raw(`
		extract(year from created_on) as year,  
		sum("won_value") as "won_value",  
		count(*) as won_bids
	`);

	const wonBid = await knex(getQuotesDB)
		.select(wonBidRawSql)
		.where(function () {
			this.where({ deleted: 0, customer_id: customer_id, status: 1 }).orWhere({
				deleted: 0,
				customer_id: customer_id,
				status: 6,
			});
		})
		.groupBy('year')
		.orderBy('year', 'desc');

	res.send(mergeBidData(yearBids, wonBid));
});

const mergeBidData = (yearBids, wonBids) => {
	const wonMap = new Map();

	wonBids.forEach((each) => {
		wonMap.set(each.year, each);
	});

	return yearBids.map((eachBid) => {
		const won = wonMap.get(eachBid.year) || {};

		const total_bid = parseFloat(eachBid.total_bid || 0);
		const won_value = parseFloat(won.won_value || 0);
		const bids = parseInt(eachBid.bids || 0);
		const won_bids = parseInt(won.won_bids || 0);

		return {
			year: eachBid.year,
			bids: eachBid.bids,
			total_bid: eachBid.total_bid,
			won_bids: won.won_bids || '0',
			won_value: won.won_value || null,
			wonValuePercent: total_bid ? ((won_value / total_bid) * 100).toFixed(2) : '0.00',
			wonCountPercent: bids ? ((won_bids / bids) * 100).toFixed(2) : '0.00',
		};
	});
};

module.exports = router;
