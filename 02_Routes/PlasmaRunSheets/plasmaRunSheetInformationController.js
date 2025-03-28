const express = require('express');
const knex = require('../../01_Database/connection');
const {
	getPlasmaRunSheetsDB,
	postPlasmaRunSheetsDB,
	getUsersPermissionsDB,
} = require('../../01_Database/database');
const { postUserNotification } = require('../userNotifications/userNotifications');
const { todayDate } = require('../../03_Utils/formatDates');

const createSheet = async (req, res) => {
	try {
		const { new_sheet } = req.body;

		await knex(postPlasmaRunSheetsDB).insert({ ...new_sheet });

		res.status(200).json({
			message: 'Sheet successfully created',
			color: 'success',
		});
	} catch (e) {
		res.status(500).json({ message: 'Error creating sheet', color: 'error', error: e });
		console.log(e);
	}
};

const getSheetInformation = async (req, res) => {
	try {
		const { sheet_id } = req.query;

		const sheetList = await knex(getPlasmaRunSheetsDB).select('*').where({ id: sheet_id });

		res.status(200).json({
			message: 'Sheet successfully retrieved',
			color: 'success',
			data: sheetList[0],
		});
	} catch (e) {
		res.status(500).json({ message: 'Error retrieving sheet items', color: 'error', error: e });
		console.log(e);
	}
};

const updateSheetInformation = async (req, res) => {
	try {
		const { set_completed, values } = req.body.update_details;

		const updatedSheet = {
			sheet_name: values.sheet_name,
			sheet_thickness: values.sheet_thickness ? values.sheet_thickness : null,
			sheet_length: values.sheet_length ? values.sheet_length : null,
			sheet_width: values.sheet_width ? values.sheet_width : null,
			created_by: values.created_by,
			created_on: values.created_on,
			program_name: values.program_name,
			program_verified: values.program_verified,
			thickness_verified: values.thickness_verified,
			length_verified: values.length_verified,
			width_verified: values.width_verified,
			verified_by: values.verified_by,
			verified_on: values.verified_on,
			heat_number: values.heat_number,
			cut_off_length: values.cut_off_length ? values.cut_off_length : null,
			cut_off_width: values.cut_off_width ? values.cut_off_width : null,
			plate_utilization: values.plate_utilization,
			completed: values.completed,
			cut_off: values.cut_off,
			rush: values.rush,
			priority: values.priority,
			operator_notes: values.operator_notes,
			manager_notes: values.manager_notes,
			deleted: values.deleted,
			completed_date: values.completed_date,
		};

		const updatedSheets = await knex(postPlasmaRunSheetsDB)
			.update(updatedSheet)
			.where({ id: values.id })
			.returning('*');

		if (set_completed == true) {
			// gets  list of users to send notification to
			const usersListToNotify = await knex(getUsersPermissionsDB)
				.select('user_id')
				.where({ manufacturing: true })
				.andWhere({ deleted: 0 });

			// send Notification
			usersListToNotify.forEach(({ user_id }) => {
				postUserNotification(
					user_id,
					'Plasma Sheet Completed',
					`Plasma Sheet ${updatedSheets[0].sheet_name} has been completed`,
					todayDate(),
					`plasmarunsheets/${updatedSheets[0].id}`,
					'plasma_run_sheet'
				);
			});
		}

		res.status(200).json({
			message:
				set_completed == true
					? 'Sheet information successfully updated and completed'
					: 'Sheet information successfully updated',
			color: 'success',
		});
	} catch (e) {
		res.status(500).json({
			message: 'Error updating sheet information',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};
module.exports = {
	createSheet,
	getSheetInformation,
	updateSheetInformation,
};
