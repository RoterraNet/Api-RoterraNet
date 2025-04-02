const express = require('express');
const router = express.Router();
const knex = require('../../01_Database/connection');
const { getUsersDB, getUsersPermissionsDB } = require('../../01_Database/database');

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

module.exports = {
	getUsers,
};
