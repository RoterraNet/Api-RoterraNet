const express = require('express');
const router = express.Router();
const database = require('../../../01_Database/database');
const knex = require('../../../01_Database/connection');

const getWorkorderQcAnswersDB = database.getWorkorderQcAnswersDB;

const postWorkordersItemsDetailsInspectionsDB = database.postWorkordersItemsDetailsInspectionsDB;
const postWorkordersItemsDetailsDB = database.postWorkordersItemsDetailsDB;
const getWorkorderQcQuestionsDB = database.getWorkordersItemsDetailsQuestionsDB;
const postWorkordersItemsDetailsInspectionsAnswersDB =
	database.postWorkordersItemsDetailsInspectionsAnswersDB;

const getWorkordersItemsDetailsInspectionsAnswersDB =
	database.getWorkordersItemsDetailsInspectionsAnswersDB;

const getWorkorderItems = database.getWorkordersItemsDB;

const getWorkordersQcQuestions = async (req, res) => {
	const { form_id, workorder_item_id } = req.query;
	try {
		const questions = await knex(getWorkorderQcQuestionsDB)
			.select('*')
			.where({ form_id: form_id });

		res.json(questions);
	} catch (error) {
		console.log(error);
		res.json({ message: 'Something Went Wrong', color: 'error', error: error });
	}
};

const postWorkordersQcAnswers = async (req, res) => {
	const { inspection_data } = req.body;

	try {
		console.log('Request Body:', inspection_data.answers);

		const [inspectionRow] = await knex(postWorkordersItemsDetailsInspectionsDB)
			.insert({
				workorder_id: inspection_data.workorder_id,
				workorder_item_id: inspection_data.workorder_item_id,
				workorder_item_detail_id: inspection_data.workorder_item_detail_id,
				title: inspection_data.title,
				form_type: inspection_data.form_type,
				inspector_id: inspection_data.inspector_id,
				created_by: inspection_data.created_by,
			})
			.returning('workorder_item_detail_inspection_id');

		const inspectionId =
			typeof inspectionRow === 'object'
				? inspectionRow.workorder_item_detail_inspection_id
				: inspectionRow;

		const answersToInsert = inspection_data.answers.map((item) => ({
			workorder_item_detail_inspection_id: inspectionId,
			question_id: item.question_id,
			answer: item.answer,
			helix_number: item.helix_number ?? null,
		}));

		await knex(postWorkordersItemsDetailsInspectionsAnswersDB).insert(answersToInsert);

		if (inspection_data.form_type == 2) {
			await knex(postWorkordersItemsDetailsDB)
				.update({
					shop_approved_id: inspection_data.inspector_id,
					shop_approved_on: new Date(),
				})
				.where({
					workorder_item_detail_id: inspection_data.workorder_item_detail_id,
				});
		}

		res.json({
			message: 'QC Answers have been Successfully Submitted',
			color: 'success',
		});
	} catch (error) {
		console.log(error);
		res.json({ message: 'Something Went Wrong', color: 'error', error });
	}
};

const getWorkordersQcAnswers = async (req, res) => {
	const requestQuery = req.query;

	try {
		const answers = await knex(getWorkordersItemsDetailsInspectionsAnswersDB)
			.select(
				'workorder_item_detail_inspection_id',
				'workorder_item_detail_id',
				'question_id',
				'question',
				'answer',
				'form_name',
				'form_section_name',
				'question_order',
				'helix_number'
			)
			.where({
				workorder_item_detail_id: requestQuery.id,
				form_type: requestQuery.form_type,
			});

		if (answers.length === 0) {
			return res.json({
				message: 'No QC answers found for this work order item detail.',
				color: 'warning',
				answers: [],
			});
		}

		res.json({
			message: 'QC Answers have been Successfully retrieved',
			color: 'success',
			answers: answers,
		});
	} catch (error) {
		console.log(error);
		res.json({ message: 'Something Went Wrong', color: 'error', error: error });
	}
};

module.exports = {
	getWorkordersQcQuestions,
	getWorkordersQcAnswers,
	postWorkordersQcAnswers,
};
