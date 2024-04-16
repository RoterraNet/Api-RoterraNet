const express = require('express');
const router = express.Router();
const {
	getUsersOffBoardingCheckList,
	postUsersOffBoardingCheckList,
} = require('../../../01_Database/database');
const knex = require('../../../01_Database/connection');

const getAllOffBoarding = async (req, res) => {
	const data = await knex(getUsersOffBoardingCheckList)
		// .select('user_id', 'preferred_name', 'position_name', 'completed', 'id')
		.select('*')
		.where({ completed: false })
		.paginate({
			isLengthAware: true,
		});
	res.send(data);
};

const createOffBoardingCheck = async (req, res) => {
	const values = req.body;

	try {
		const addData = await knex(postUsersOffBoardingCheckList).insert(values);

		res.send(addData);
	} catch (error) {
		console.error('Error creating new hire check:', error);
		throw error;
	}
};

const updateOneOffBoardingCheck = async (req, res) => {
	const body = req.body;
	const data = await knex(postUsersOffBoardingCheckList)
		.update(body.update)
		.where({ id: body.id });
	res.send('data');
};

module.exports = {
	getAllOffBoarding,
	createOffBoardingCheck,
	updateOneOffBoardingCheck,
};
