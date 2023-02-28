const express = require('express');
const router = express.Router();
const database = require('../../../01_Database/database');
const knex = require('../../../01_Database/connection');
const { format, subMonths } = require('date-fns');
const SearchBuilder = require('../../RouteCreaters/RouteHelpers/SearchBuilder');
const authorize = require('../../Authorization/authorization');

const getWorkordersItemsDetailsDB = database.getWorkordersItemsDetailsDB;
const getPlasmaRunSheetsDB = database.getPlasmaRunSheetsDB;

router.get('/pipe_processed/', authorize({ workorder_manager: false }), async (req, res) => {
	const { start, end } = req.query;

	try {
		const allPipeSizes = await knex(getWorkordersItemsDetailsDB)
			.select('pipe_id', 'pipe_length', 'pipe_od')
			.whereNotNull('helix_1_thickness')
			.andWhereBetween('pipe_approved_on', [start, end])
			.orderBy('pipe_od', 'asc');

		const allPipeSorted = {};

		allPipeSizes.map((eachPlate) => {
			if (allPipeSorted.hasOwnProperty(eachPlate.pipe_id)) {
				allPipeSorted[eachPlate.pipe_id].totalFeet =
					allPipeSorted[eachPlate.pipe_id].totalFeet + eachPlate.pipe_length;
			} else {
				allPipeSorted[eachPlate.pipe_id] = {
					pipeType: eachPlate.pipe_od,
					totalFeet: eachPlate.pipe_length,
				};
			}
		});

		res.json(allPipeSorted);
	} catch (error) {
		res.status(500).json({ errorMsg: 'something went wrong', error: error });
	}
});

router.get('/plate_processed/', authorize({ workorder_manager: true }), async (req, res) => {
	const { start, end } = req.query;

	try {
		const AllPlate = await knex(getPlasmaRunSheetsDB)
			.select(
				'sheet_thickness',
				'thickness_name',
				'sheet_length',
				'sheet_width',
				'plate_utilization',
				'id'
			)
			.where({ completed: true })

			.andWhereBetween('created_on', [start, end])
			.andWhere({ deleted: false })
			.orderBy('sheet_thickness', 'asc');

		const allPlateSorted = {};
		AllPlate.map((eachPlate) => {
			const sqrFoot = (eachPlate.sheet_length * eachPlate.sheet_width) / 144;
			const plate_utilization = parseFloat(eachPlate.plate_utilization) / 100;
			if (allPlateSorted.hasOwnProperty(eachPlate.sheet_thickness)) {
				allPlateSorted[eachPlate.sheet_thickness].totalSqrFoot =
					allPlateSorted[eachPlate.sheet_thickness].totalSqrFoot + sqrFoot;

				allPlateSorted[eachPlate.sheet_thickness].plate_utilization =
					allPlateSorted[eachPlate.sheet_thickness].plate_utilization + plate_utilization;

				allPlateSorted[eachPlate.sheet_thickness].setLength++;
			} else {
				allPlateSorted[eachPlate.sheet_thickness] = {
					plateType: eachPlate.thickness_name,
					totalSqrFoot: sqrFoot,
					plate_utilization: plate_utilization,
					setLength: 1,
				};
			}
		});

		for (const key in allPlateSorted) {
			allPlateSorted[key].plate_utilization =
				(allPlateSorted[key].plate_utilization / allPlateSorted[key].setLength) * 100;
		}
		res.json(allPlateSorted);
	} catch (error) {
		console.log(error);
		res.status(500).json({ errorMsg: 'something went wrong', error: error });
	}
});

module.exports = router;
