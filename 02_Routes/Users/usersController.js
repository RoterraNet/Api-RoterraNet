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
					})
					.where('user_id', '=', user_id);
				console.log('activated user');

				if (create_onboarding) {
					// insert an onboarding checklist for user
					await knex(postOnboardingChecklistsDB).insert({
						user_id: user_id,
						start_date: start_date,
					});
					console.log('added onboarding checklist');
				}

				// check if user is in users_benefits table
				const benefitsData = await knex(postUsersBenefitsDB)
					.select('*')
					.where({ user_id: user_id });

				// if not, add user into table
				if (benefitsData.length == 0) {
					const benefitsDate = new Date(start_date);
					benefitsDate.setDate(benefitsDate.getDate() + 90);
					const rrspDate = new Date(start_date);
					rrspDate.setDate(rrspDate.getDate() + 365);
					console.log(benefitsDate, rrspDate);
					await knex(postUsersBenefitsDB).insert({
						user_id: user_id,
						effective_date: benefitsDate,
						rrsp_eligibility: rrspDate,
					});
					console.log('user was not in benefits table, now addeed');
				}

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
