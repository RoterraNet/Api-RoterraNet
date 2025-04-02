const express = require('express');
const knex = require('../../01_Database/connection');
const { getWorkordersHeatsDB } = require('../../01_Database/database');
const subMonths = require('date-fns/subMonths');
const format = require('date-fns/format');

const getWorkorderHeats = async (req, res) => {
	try {
		// get list of workorder heats
		const { sheet_thickness } = req.body;

		// heats from 1 year ago until present
		const oneYearAgo = format(subMonths(new Date(), 12), 'yyyy-MM-dd');
		const workorderHeats = sheet_thickness
			? await knex(getWorkordersHeatsDB)
					.select('heat')
					.where({ plate: sheet_thickness })
					.andWhereBetween('created_on', [oneYearAgo, format(new Date(), 'yyyy-MM-dd')])
					.orderBy('id', 'desc')
			: [];

		res.status(200).json({
			message: 'Workorder heats retrieved successfully',
			color: 'success',
			data: workorderHeats,
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
	getWorkorderHeats,
};
