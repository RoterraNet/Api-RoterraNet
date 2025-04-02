const express = require('express');
const knex = require('../../01_Database/connection');
const { getWorkordersDB } = require('../../01_Database/database');

const getWorkorders = async (req, res) => {
	try {
		// get list of workorder heats
		const workorders = await knex(getWorkordersDB)
			.select('workorder_id', 'workorder_name')
			.whereNotNull('workorder_name')
			.orderBy('workorder_name', 'desc')
			.limit(1000);

		res.status(200).json({
			message: 'Workorder heats retrieved successfully',
			color: 'success',
			data: workorders,
		});
	} catch (e) {
		res.status(500).json({
			message: 'Error retrieving workorder heats',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

module.exports = {
	getWorkorders,
};
