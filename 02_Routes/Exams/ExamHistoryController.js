const knex = require('../../01_Database/connection');
const { postCompletedExamsHistoryDB } = require('../../01_Database/database');

const getExamHistory = async (req, res) => {
	try {
		const { assigned_exam_id } = req.query;

		const details = await knex(postCompletedExamsHistoryDB)
			.select('*')
			.where({ assigned_exam_id: assigned_exam_id });
		res.status(200).json({
			message: 'Completed exam details successfully retrieved',
			color: 'success',
			data: details[0],
		});
	} catch (e) {
		res.status(500).json({
			message: 'Problem getting completed exam details',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

module.exports = {
	getExamHistory,
};
