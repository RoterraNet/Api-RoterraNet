const knex = require('../../01_Database/connection');
const { getPoEmailListDB, postPoEmailListDB } = require('../../01_Database/database');

const getPoEmailList = async (req, res) => {
	try {
		const emailList = await knex(getPoEmailListDB).where({ deleted: false });

		res.status(200).json({
			message: 'Po Email List successfully retrieved',
			color: 'success',
			data: emailList,
		});
	} catch (e) {
		res.status(500).json({
			message: 'Problem getting Po Email List',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const addPoEmailList = async (req, res) => {
	try {
		const { user_id, created_on, created_by } = req.body;
		const emailList = await knex(postPoEmailListDB).insert({
			user_id: user_id,
			created_on: created_on,
			created_by: created_by,
		});

		res.status(200).json({ message: 'User was added to PO Email list.', color: 'success' });
	} catch (e) {
		res.status(500).json({
			message: 'Problem Adding user to Po Email List',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const deletePoEmailList = async (req, res) => {
	try {
		const { id, update } = req.body;
		const deleteEmail = await knex(postPoEmailListDB)
			.where({ id: id })
			.update({ ...update });
		res.status(200).json({ message: 'Po Email list successfully deleted', color: 'success' });
	} catch (e) {
		res.status(500).json({
			message: 'Problem Deleting PO Email List',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

module.exports = {
	getPoEmailList,
	addPoEmailList,
	deletePoEmailList,
};
