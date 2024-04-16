const express = require('express');
const router = express.Router();
const {
	getUsersOffBoardingCheckList,
	getUsersNewUsersCheckList,
} = require('../../../01_Database/database');
const knex = require('../../../01_Database/connection');

const getAllHrTodo = async (req, res) => {
	const offBoardingCount = await knex(getUsersOffBoardingCheckList)
		.count()
		.where({ completed: false });

	const newHireCount = await knex(getUsersNewUsersCheckList).count().where({ completed: false });

	res.send({
		offBoardingCount: offBoardingCount[0].count || 0,
		newHireCount: newHireCount[0].count || 0,
	});
};

module.exports = {
	getAllHrTodo,
};
