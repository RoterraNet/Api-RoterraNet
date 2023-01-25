const express = require('express');
const router = express.Router({ mergeParams: true });
const knex = require('../01_Database/connection');

const database = require('../01_Database/database');
const getWorkordersItemsDetailsQuestionsDB = database.getWorkordersItemsDetailsQuestionsDB;
const postWorkordersItemsDetailsQuestionsDB = database.postWorkordersItemsDetailsQuestionsDB;

const datefns = require('date-fns');
const today_now = datefns.format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

// GETTING JUST THE RIGHT QUESTIONS => with post request
// /workorders/:id/workorder_items/:id/workorders_items_details/:id/questions -> GET -> getting just the questions
router.post('/', async (req, res) => {
	const { values } = req.body;
	let questions = await knex(getWorkordersItemsDetailsQuestionsDB).whereIn('workorder_item_detail_question_id', values).orderBy('question_order');

	res.json(questions);
});

module.exports = router;
