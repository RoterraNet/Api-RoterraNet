const express = require('express');
const router = express.Router();
const knex = require('../../01_Database/connection');
const {
	getUsersDB,
	getUsersPermissionsDB,
	postUsersDB,
	postUsersBenefitsDB,
	postOnboardingChecklistsDB,
} = require('../../01_Database/database');
const datefns = require('date-fns');
const {
	addToBenefits,
	addOnboardingChecklist,
	addEmploymentHistory,
} = require('./userActivationFunctions');

const getUsers = async (req, res) => {
	try {
		const { type } = req.query;

		switch (type) {
			case 'all':
				const allUsersData = await knex(getUsersDB).select('user_id', 'preferred_name');
				res.status(200).json({
					message: 'All users retrieved',
					color: 'success',
					data: allUsersData,
				});
				return;

			case 'active':
				const activeUsersData = await knex(getUsersDB).select('*').where({ deleted: 0 });
				res.status(200).json({
					message: 'All active users retrieved',
					color: 'success',
					data: activeUsersData,
				});
				return;

			case 'inactive':
				const inactiveUsersData = await knex(getUsersDB)
					.select('user_id', 'preferred_name')
					.where({ deleted: 1 });
				res.status(200).json({
					message: 'All inactive users retrieved',
					color: 'success',
					data: inactiveUsersData,
				});
				return;

			case 'plasma_table_operators':
				const plasmaTableOperatorsData = await knex(getUsersPermissionsDB)
					.select(
						knex.raw("CONCAT(first_name,' ',last_name) as preferred_name"),
						'user_id'
					)
					.where({ deleted: 0 })
					.andWhere({ plasma_table_operator: true })
					.orderBy('first_name', 'asc');
				res.status(200).json({
					message: 'All plasma table operator users retrieved',
					color: 'success',
					data: plasmaTableOperatorsData,
				});
				return;

			case 'managers':
				const managers = await knex(getUsersPermissionsDB)
					.select('user_id', 'preferred_name')
					.where({ deleted: 0 })
					.andWhere('user_rights', '<=', 4)
					.orderBy('preferred_name', 'asc');
				res.status(200).json({
					message: 'All managers retrieved',
					color: 'success',
					data: managers,
				});
				return;
		}

		res.status(400).json({ message: 'Missing or invalid query type', color: 'error' });
	} catch (e) {
		res.status(500).json({
			message: 'Something went wrong retrieving user data',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const updateUser = async (req, res) => {
	try {
		const {
			user_id,
			type,
			senority_debit,
			start_date,
			deleted_on,
			edited_by,
			create_onboarding,
			position_id,
			manager_id,
			reason,
		} = req.body;
		const today_now = datefns.format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

		console.log(create_onboarding);
		switch (type) {
			case 'activate':
				// set user to not-deleted in users table
				await knex(postUsersDB)
					.update({
						activated_on: today_now,
						activated_by: edited_by,
						start_date: start_date,
						deleted: 0,
						deleted_on: null,
						deleted_by: null,
						senority_debit: senority_debit,
						position: position_id,
						manager: manager_id,
					})
					.where('user_id', '=', user_id);
				console.log(`Activated user ${user_id}`);

				// do activation functions (FYI functions return ID of inserted row if successful, -1 if error or row was not added)
				let checklistId;
				if (create_onboarding) {
					checklistId = await addOnboardingChecklist(user_id, start_date);
				}
				const benefitsId = await addToBenefits(user_id, start_date);
				const employmentHistoryId = await addEmploymentHistory(
					user_id,
					start_date,
					position_id,
					manager_id,
					reason
				);

				res.status(200).json({
					message: 'User successfully activated',
					color: 'success',
				});
				break;

			case 'deactivate':
				// set user to deleted in users table
				await knex(postUsersDB)
					.update({
						deleted_by: edited_by,
						deleted_on: deleted_on,
						deleted: 1,
						senority_debit: senority_debit,
					})
					.where('user_id', '=', user_id);

				res.status(200).json({
					message: 'User successfully deactivated',
					color: 'success',
				});
				break;

			default:
				res.status(400).json({
					message: 'Invalid update type (must be "activate" or "deactivate")',
					color: 'error',
				});
				break;
		}
	} catch (e) {
		res.status(500).json({
			message: 'Something went wrong updating user data',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

module.exports = {
	getUsers,
	updateUser,
};
