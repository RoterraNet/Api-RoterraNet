const knex = require('../../../01_Database/connection');

const getOnboardingQuestions = async (req, res) => {
	try {
		const data = await knex('roterranet.users_questions').select();
		console.log(data);
		res.send(data);
	} catch (error) {
		console.log('error', error);
		res.send(error);
	}
};

const updateOnBoardingAnswers = async (req, res) => {
	try {
		const data = await knex('roterranet.users_questions_answers').insert({
			question_id: 1,
			user_id: 614,
		});

		res.send(data);
	} catch (error) {
		console.log('error', error);
		res.send(error);
	}
};
module.exports = {
	getOnboardingQuestions,
	updateOnBoardingAnswers,
};
