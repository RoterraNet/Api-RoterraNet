const knex = require('../../../01_Database/connection');
const {
	getUsersNewUsersCheckList,
	postUsersNewUsersCheckList,
	postOnboardingChecklists
} = require('../../../01_Database/database');

const getAllNewHires = async (req, res) => {
	const data = await knex(getUsersNewUsersCheckList)
		.select('user_id', 'preferred_name', 'position_name', 'completed', 'id')
		.where({ completed: false })
		.paginate({
			isLengthAware: true,
		});
	res.send(data);
};

const createNewHireCheck = async (values) => {
	try {
		const addData = await knex(postUsersNewUsersCheckList).insert(values);
		await knex(postOnboardingChecklists).insert({user_id: values.user_id, start_date: start_date});
	} catch (error) {
		console.error('Error creating new hire check:', error);
		throw error;
	}
};

const updateOneNewHireCheck = async (req, res) => {
	const body = req.body;
	const data = await knex(postUsersNewUsersCheckList).update(body.update).where({ id: body.id });
	res.send('data');
};

module.exports = {
	getAllNewHires,
	createNewHireCheck,
	updateOneNewHireCheck,
};

