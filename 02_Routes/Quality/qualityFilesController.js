const knex = require('../../01_Database/connection');
const { getQualityFilesDB, postQualityFilesDB } = require('../../01_Database/database');

const getQualityFiles = async (req, res) => {
	try {
		const { type } = req.query;

		const qualityFilesData = await knex(getQualityFilesDB)
			.select('*')
			.whereNull('deleted_by')
			.andWhere({ type: type });

		const sections = {};
		for (const file of qualityFilesData) {
			if (file.section in sections) {
				sections[file.section].push(file);
			} else {
				sections[file.section] = [file];
			}
		}

		res.status(200).json({
			message: 'Quality files successfully retrieved',
			color: 'success',
			data: sections,
		});
	} catch (e) {
		res.status(500).json({
			message: 'Problem getting quality files',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const addQualityFile = async (req, res) => {
	try {
		await knex(postQualityFilesDB).insert(req.body);

		res.status(200).json({ message: 'Quality file successfully uploaded', color: 'success' });
	} catch (e) {
		res.status(500).json({
			message: 'Problem uploading quality file',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const deleteQualityFile = async (req, res) => {
	try {
		const { deleted_by, deleted_on } = req.body;
		await knex(postQualityFilesDB)
			.update({ deleted_by: deleted_by, deleted_on: deleted_on })
			.where({ id: req.body.id });
		res.status(200).json({ message: 'Quality File successfully deleted', color: 'success' });
	} catch (e) {
		res.status(500).json({
			message: 'Problem uploading quality file',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

module.exports = {
	getQualityFiles,
	addQualityFile,
	deleteQualityFile,
};
