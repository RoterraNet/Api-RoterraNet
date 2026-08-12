const knex = require('../../01_Database/connection');
const { PoFilesDB } = require('../../01_Database/database');

const getPoFiles = async (req, res) => {
	try {
		const { type } = req.query;

		const poFilesData = await knex(PoFilesDB)
			.select('*')
			.whereNull('deleted_by')
			.andWhere({ type: type })
			.orderBy('file_name', 'asc');

		const sections = {};
		for (const file of poFilesData) {
			if (file.section in sections) {
				sections[file.section].push(file);
			} else {
				sections[file.section] = [file];
			}
		}

		res.status(200).json({
			message: 'Purchasing files successfully retrieved',
			color: 'success',
			data: sections,
		});
	} catch (e) {
		res.status(500).json({
			message: 'Problem getting po files',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const addPoFile = async (req, res) => {
	try {
		await knex(PoFilesDB).insert(req.body);

		res.status(200).json({
			message: 'Purchasing file successfully uploaded',
			color: 'success',
		});
	} catch (e) {
		res.status(500).json({
			message: 'Problem uploading po file',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const deletePoFile = async (req, res) => {
	try {
		const { deleted_by, deleted_on } = req.body;
		await knex(PoFilesDB)
			.update({ deleted_by: deleted_by, deleted_on: deleted_on })
			.where({ id: req.body.id });
		res.status(200).json({ message: 'Purchasing File successfully deleted', color: 'success' });
	} catch (e) {
		res.status(500).json({
			message: 'Problem uploading purchasing file',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

module.exports = {
	getPoFiles,
	addPoFile,
	deletePoFile,
};
