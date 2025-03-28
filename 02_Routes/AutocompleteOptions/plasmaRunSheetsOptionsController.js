const express = require('express');
const knex = require('../../01_Database/connection');
const {
	getWorkordersDB,
	getPlasma_run_sheet_helix_sizesDB,
	getPlatesDB,
	getWorkordersHeatsDB,
	getUsersPermissionsDB,
} = require('../../01_Database/database');
const subMonths = require('date-fns/subMonths');
const format = require('date-fns/format');

const getSheetInformationOptions = async (req, res) => {
	try {
		// get options for sheet thickness, plasma operators, workorder heats, priorities
		const { sheet_id } = req.query;

		const thicknessOptions = await knex(getPlatesDB)
			.select('thickness', 'id')
			.orderBy('sortorder', 'asc');

		const operatorOptions = await knex(getUsersPermissionsDB)
			.select(knex.raw("CONCAT(first_name,' ',last_name) as preferred_name"), 'user_id')
			.where('deleted', '=', 0)
			.andWhere({ plasma_table_operator: true })
			.orderBy('first_name', 'asc');

		// heats from 6 months ago until present
		const sixMonthsAgo = format(subMonths(new Date(), 12), 'yyyy-MM-dd');
		const heatOptions = await knex(getWorkordersHeatsDB)
			.select('heat')
			.where({ plate: sheet_id })
			.andWhereBetween('created_on', [sixMonthsAgo, format(new Date(), 'yyyy-MM-dd')])
			.orderBy('id', 'desc');

		// priorities from 1-10
		const prioritiesOptions = [];
		for (let i = 1; i <= 10; i++) {
			prioritiesOptions.push({ priority: i });
		}

		res.status(200).json({
			message: 'Sheet information autocomplete options retrieved successfully',
			color: 'success',
			data: {
				thicknessOptions: thicknessOptions,
				operatorOptions: operatorOptions,
				heatOptions: heatOptions,
				prioritiesOptions: prioritiesOptions,
			},
		});
	} catch (e) {
		res.status(500).json({
			message: 'Error retrieving sheet information autocomplete options',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const getSheetItemsOptions = async (req, res) => {
	try {
		// get options for inner diameter (ID) sizes, plasma operators, workorders

		const idSizeOptions = await knex(getPlasma_run_sheet_helix_sizesDB)
			.select('id', 'name')
			.orderBy('decimal', 'acs');

		const operatorOptions = await knex(getUsersPermissionsDB)
			.select(knex.raw("CONCAT(first_name,' ',last_name) as preferred_name"), 'user_id')
			.where('deleted', '=', 0)
			.andWhere({ plasma_table_operator: true })
			.orderBy('first_name', 'asc');

		const workorderOptions = await knex(getWorkordersDB)
			.select('workorder_id', 'workorder_name')
			.whereNotNull('workorder_name')
			.orderBy('workorder_name', 'desc')
			.limit(1000);

		res.status(200).json({
			message: 'Sheet items autocomplete options retrieved successfully',
			color: 'success',
			data: {
				idSizeOptions: idSizeOptions,
				operatorOptions: operatorOptions,
				workorderOptions: workorderOptions,
			},
		});
	} catch (e) {
		res.status(500).json({
			message: 'Error retrieving sheet items autocomplete options',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

module.exports = {
	getSheetInformationOptions,
	getSheetItemsOptions,
};
