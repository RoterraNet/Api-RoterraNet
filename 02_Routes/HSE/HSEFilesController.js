const knex = require('../../01_Database/connection');
const { getHSEFilesDB, postHSEFilesDB } = require('../../01_Database/database');

const getHSEFiles = async (req, res) => {
	try {
		const { type } = req.query;

		const hseFilesData = await knex(getHSEFilesDB)
			.select('*')
			.whereNull('deleted_by')
			.andWhere({ type: type });

		const sections = {};
		for (const file of hseFilesData) {
			if (file.section in sections) {
				sections[file.section].push(file);
			} else {
				sections[file.section] = [file];
			}
		}

		res.status(200).json({
			message: 'HSE files successfully retrieved',
			color: 'success',
			data: sections,
		});
	} catch (e) {
		res.status(500).json({
			message: 'Problem getting HSE files',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const addHSEFile = async (req, res) => {
	try {
		await knex(postHSEFilesDB).insert(req.body);

		res.status(200).json({ message: 'HSE file successfully uploaded', color: 'success' });
	} catch (e) {
		res.status(500).json({
			message: 'Problem uploading HSE file',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const deleteHSEFile = async (req, res) => {
	try {
		const { deleted_by, deleted_on } = req.body;
		await knex(postHSEFilesDB)
			.update({ deleted_by: deleted_by, deleted_on: deleted_on })
			.where({ id: req.body.id });
		res.status(200).json({ message: 'HSE File successfully deleted', color: 'success' });
	} catch (e) {
		res.status(500).json({
			message: 'Problem uploading HSE file',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

module.exports = {
	getHSEFiles,
	addHSEFile,
	deleteHSEFile,
};
