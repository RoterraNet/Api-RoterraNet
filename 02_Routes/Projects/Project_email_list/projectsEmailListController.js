const {
	getProjectsEmailListDB,
	postProjectsEmailListDB,
} = require('../../../01_Database/database');
const knex = require('../../../01_Database/connection');

const getProjectsEmailList = async (req, res) => {
	try {
		const emailList = await knex(getProjectsEmailListDB).where({ deleted: false });

		res.status(200).json({
			message: 'Project Email List successfully retrieved',
			color: 'success',
			data: emailList,
		});
	} catch (e) {
		res.status(500).json({
			message: 'Problem getting Project Email List',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const addProjectsEmailList = async (req, res) => {
	try {
		const { user_id, created_on, created_by } = req.body;
		const emailList = await knex(postProjectsEmailListDB).insert({
			user_id: user_id,
			created_on: created_on,
			created_by: created_by,
		});

		res.status(200).json({
			message: 'User was added to Projects Email list.',
			color: 'success',
		});
	} catch (e) {
		res.status(500).json({
			message: 'Problem Adding user to Projects Email List',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const deleteProjectsEmailList = async (req, res) => {
	try {
		const { id, update } = req.body;
		const deleteEmail = await knex(postProjectsEmailListDB)
			.where({ id: id })
			.update({ ...update });
		res.status(200).json({
			message: 'Projects Email list successfully deleted',
			color: 'success',
		});
	} catch (e) {
		res.status(500).json({
			message: 'Problem Deleting Projects Email List',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

module.exports = {
	getProjectsEmailList,
	addProjectsEmailList,
	deleteProjectsEmailList,
};
