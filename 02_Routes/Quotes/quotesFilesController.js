const knex = require('../../01_Database/connection');
const { QuotesFilesDB } = require('../../01_Database/database');

const getQuotesFiles = async (req, res) => {
	try {
		const { type } = req.query;

		const quotesFilesData = await knex(QuotesFilesDB)
			.select('*')
			.whereNull('deleted_by')
			.andWhere({ type: type })
			.orderBy('file_name', 'asc');

		const sections = {};
		for (const file of quotesFilesData) {
			if (file.section in sections) {
				sections[file.section].push(file);
			} else {
				sections[file.section] = [file];
			}
		}

		res.status(200).json({
			message: 'Quotes files successfully retrieved',
			color: 'success',
			data: sections,
		});
	} catch (e) {
		res.status(500).json({
			message: 'Problem getting quotes files',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const addQuotesFile = async (req, res) => {
	try {
		await knex(QuotesFilesDB).insert(req.body);

		res.status(200).json({ message: 'Quotes file successfully uploaded', color: 'success' });
	} catch (e) {
		res.status(500).json({
			message: 'Problem uploading quotes file',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const deleteQuotesFile = async (req, res) => {
	try {
		const { deleted_by, deleted_on } = req.body;
		await knex(QuotesFilesDB)
			.update({ deleted_by: deleted_by, deleted_on: deleted_on })
			.where({ id: req.body.id });
		res.status(200).json({ message: 'Quotes File successfully deleted', color: 'success' });
	} catch (e) {
		res.status(500).json({
			message: 'Problem uploading quotes file',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

module.exports = {
	getQuotesFiles,
	addQuotesFile,
	deleteQuotesFile,
};
