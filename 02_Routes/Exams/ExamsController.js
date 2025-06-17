const knex = require('../../01_Database/connection');
const { getExamsDB, postExamsDB, examPageDetails } = require('../../01_Database/database');

const createExam = async (req, res) => {
	try {
		const { title, page_count } = req.body;

		await knex(postExamsDB).insert({ is_draft: true, title: title, page_count: page_count });

		res.status(200).json({ message: 'Exam successfully created', color: 'success' });
	} catch (e) {
		res.status(500).json({
			message: 'Problem creating exam',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const getExams = async (req, res) => {
	try {
		const exams = await knex(getExamsDB)
			.select('*')
			.where({ deleted: false })
			.orderBy('exam_id', 'asc');

		res.status(200).json({
			message: 'Exams successfully retrieved',
			color: 'success',
			data: exams,
		});
	} catch (e) {
		res.status(500).json({
			message: 'Problem retrieving exams',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const updateExam = async (req, res) => {
	try {
		const { exam_id, update_details } = req.body;

		console.log(exam_id, update_details);
		await knex(postExamsDB).update(update_details).where({ exam_id: exam_id });

		res.status(200).json({
			message: 'Exam successfully deleted',
			color: 'success',
		});
	} catch (e) {
		res.status(500).json({
			message: 'Problem deleting exam',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

module.exports = {
	createExam,
	getExams,
	updateExam,
};
