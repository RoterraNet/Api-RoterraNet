const express = require('express');
const knex = require('../../01_Database/connection');
const { signableFormsDB } = require('../../01_Database/database');

const getSignableForms = async (req, res, next) => {
	try {
		// get list of forms
		const formsList = await knex(signableFormsDB)
			.select('*')
			.whereNull('deleted_by')
			.orderBy('file_name', 'asc');

		res.status(200).json({
			message: 'Forms retrieved successfully',
			color: 'success',
			data: formsList,
		});
	} catch (e) {
		console.log('Get forms error: ', e);
		next(e);
	}
};

const addSignableForm = async (req, res, next) => {
	try {
		await knex(signableFormsDB).insert(req.body);

		res.status(200).json({ message: 'Form successfully uploaded', color: 'success' });
	} catch (e) {
		console.log('Add form error: ', e);
		next(e);
	}
};

const deleteSignableForm = async (req, res, next) => {
	try {
		const { deleted_by, deleted_on } = req.body;
		await knex(signableFormsDB)
			.update({ deleted_by: deleted_by, deleted_on: deleted_on })
			.where({ id: req.body.id });
		res.status(200).json({ message: 'Form successfully deleted', color: 'success' });
	} catch (e) {
		console.log('Delete form error: ', e);
		next(e);
	}
};

const getFormToSign = async (req, res, next) => {
	try {
		// get list of forms
		const { form_id } = req.query;
		console.log(form_id);
		const formToSign = await knex(signableFormsDB)
			.select('*')
			.whereNull('deleted_by')
			.andWhere({ id: form_id });

		res.status(200).json({
			message: 'Form to sign retrieved successfully',
			color: 'success',
			data: formToSign[0],
		});
	} catch (e) {
		console.log('Get form to sign error: ', e);
		next(e);
	}
};

module.exports = {
	getSignableForms,
	addSignableForm,
	deleteSignableForm,
	getFormToSign,
};
