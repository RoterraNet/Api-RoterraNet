const express = require('express');
const knex = require('../../01_Database/connection');
const { getPlatesDB } = require('../../01_Database/database');

const getThickness = async (req, res) => {
	try {
		// get list of sheet thicknesses
		const thicknessList = await knex(getPlatesDB)
			.select('thickness', 'id')
			.orderBy('sortorder', 'asc');

		res.status(200).json({
			message: 'Plate thickness list retrieved successfully',
			color: 'success',
			data: thicknessList,
		});
	} catch (e) {
		res.status(500).json({
			message: 'Error retrieving plate thickness list',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

module.exports = {
	getThickness,
};
