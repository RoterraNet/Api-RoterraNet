const express = require('express');
const {
	postProjectSheetItemListDB,
	getProjectSheetItemListDB,
	getPipesDB,

	postProjectSheetItemListDetailsDB,
	getProjectSheetItemListDetailsDB,
	getPlatesDB,
	getWorkordersDB,
	postWorkordersDB,
	getProjectsDB,
	postWorkordersItemsDB,
} = require('../../../01_Database/database');

const router = express.Router();
const knex = require('../../../01_Database/connection');
const authorize = require('../../Authorization/authorization');
const { todayDate } = require('../../../03_Utils/formatDates');
const { formatProjectSheetPipes } = require('./project_sheet_functions');
const { result } = require('lodash');

router.get('/get_sheet/:project_id', authorize(), async (req, res) => {
	const { project_id } = req.params;
	const { deleted } = req.query;
	try {
		const listOfSheetItems = await knex(getProjectSheetItemListDB)
			.select(
				'id as item_id',
				'hp_num',
				'project_id',
				'pile_type',
				'pipe_id',
				'helix_1_diameter',
				'helix_1_id',
				'helix_1',
				'helix_2_diameter',
				'helix_2_id',
				'helix_2',
				'helix_3_diameter',
				'helix_3_id',
				'helix_3',
				'helix_4_diameter',
				'helix_4_id',
				'helix_4',
				'helix_spacing',
				'min_embedment_depth',
				'pile_length',
				'min_torque',
				'count',
				'compression_load',
				'lateral_load',
				'tension_load',
				'deleted',
				'deleted_on',
				'deleted_by',
				'item_count',
				'cost',
				'sale_price'
			)
			.andWhere({ project_id: project_id })
			.orderByRaw('LENGTH(hp_num)')
			.orderBy('hp_num', 'asc')

			.where({ deleted: deleted });

		res.json(listOfSheetItems);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: 'something went wrong,', error: error });
	}
});

router.get('/options/', authorize(), async (req, res) => {
	const rawSql = knex.raw(`CONCAT(od, ' ', '(', wall ,')') as pipe, id`);
	const pipeOptions = await knex(getPipesDB).select(rawSql).orderBy('od', 'asc');
	const helixOptions = await knex(getPlatesDB)
		.select('thickness as plate_dimensions', 'id')
		.orderBy('sortorder', 'asc');
	res.json({ pipe: pipeOptions, helix: helixOptions });
});

router.put('/updateMultiRow/', authorize(), async (req, res) => {
	const {
		id,
		update: { pipes, updated_on, updated_by },
	} = req.body;

	try {
		pipes.map(async (pipe) => {
			await knex(postProjectSheetItemListDB)
				.update({
					hp_num: pipe.hp_num,
					pile_type: pipe.pipe_id,
					helix_1_diameter: pipe.helix_1_diameter,
					helix_1_id: pipe.helix_1_id,
					helix_2_diameter: pipe.helix_2_diameter,
					helix_2_id: pipe.helix_2_id,
					helix_3_diameter: pipe.helix_3_diameter,
					helix_3_id: pipe.helix_3_id,
					helix_4_diameter: pipe.helix_4_diameter,
					helix_4_id: pipe.helix_4_id,
					helix_spacing: pipe.helix_spacing,
					min_embedment_depth: pipe.min_embedment_depth,
					pile_length: pipe.pile_length,
					min_torque: pipe.min_torque,
					count: pipe.count,
					compression_load: pipe.compression_load,
					lateral_load: pipe.lateral_load,
					tension_load: pipe.tension_load,
					cost: pipe.cost,
					sale_price: pipe.sale_price,
				})
				.where({ id: pipe.item_id });
		});

		res.status(202).json({
			color: 'success',
			msg: 'Update Successful',
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: error,
			color: 'error',
			msg: 'Unable to update. Try again later',
		});
	}
});
router.put('/updateOneRow/', authorize(), async (req, res) => {
	const { id, update } = req.body;

	try {
		const updateOneCll = await knex(postProjectSheetItemListDB)
			.update({ ...update })
			.where({ id: id });
		res.status(202).json({
			color: 'success',
			msg: 'Update Completed press refresh to load most recent',
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: error,
			color: 'error',
			msg: 'Unable to update. Try again later',
		});
	}
});
router.put('/updateRow/', authorize(), async (req, res) => {
	const values = req.body;
	delete values?.update?.item_count;
	try {
		console.log(values?.update);
		const totalOfPiles = await knex(getProjectSheetItemListDetailsDB)
			.select('id')
			.where({ project_id: values?.update?.project_id })
			.andWhere({ deleted: false });

		if (totalOfPiles.length === 0) {
			// Updates Project schedule WITHOUT updating the pile list
			const updateOneObject = await knex(postProjectSheetItemListDB)
				.update({ ...values.update })
				.where({ id: values.id })
				.returning('*');
		} else {
			// checks if new Pile in schedule is in pile list
			const checkPileListRows = await knex(getProjectSheetItemListDetailsDB)
				.select('id')
				.where({ project_sheet_item_list_id: values.id })
				.andWhere({ deleted: false });

			if (checkPileListRows.length === 0) {
				const updateOneObject = await knex(postProjectSheetItemListDB)
					.update({ ...values.update })
					.where({ id: values.id })
					.returning('*');

				const activeCount = await knex(getProjectSheetItemListDetailsDB)
					.count()
					.where({ project_id: updateOneObject[0].project_id })
					.andWhere({ deleted: false });

				let totalCount = parseInt(activeCount[0].count) + 1;

				for (let i = 0; i < values.update.count; i++) {
					console.log('totalCount', totalCount);
					const insertArray = {
						project_id: updateOneObject[0].project_id,
						item_number: totalCount,
						project_sheet_item_list_id: updateOneObject[0].id,
					};
					const listOfSheetItemsDetail = await knex(
						postProjectSheetItemListDetailsDB
					).insert({
						...insertArray,
						created_on: new Date(),
					});
					totalCount++;
				}

				console.log('add to detail by count');
			} else {
				console.log('noirmal update');
				const updateOne = await knex(postProjectSheetItemListDB)
					.update({ ...values.update })
					.where({ id: values.id });
			}
		}
		res.status(202).json({ color: 'success', msg: 'Update Completed' });
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: error,
			color: 'error',
			msg: 'Unable to update. Try again later',
		});
	}
});

router.put('/deleteRow/', authorize(), async (req, res) => {
	const values = req.body;
	console.log(values);
	const UpdateOne = await knex(postProjectSheetItemListDB)
		.update({ ...values.delete })
		.where({ id: values.id });

	res.json(UpdateOne);
});

router.post('/newRows/', authorize(), async (req, res) => {
	const { amountOfNewRows, created_by, created_on, project_id } = req.body;

	for (let i = 0; amountOfNewRows > i; i++) {
		const addToDb = await knex(postProjectSheetItemListDB).insert({
			created_by,
			created_on,
			project_id,
		});
	}

	res.json('addeOne');
});

router.post('/updatePileSchedule/', authorize(), async (req, res) => {
	const { created_by, created_on, project_id } = req.body;

	const addToDb = await knex(postProjectSheetItemListDB).insert({
		created_by,
		created_on,
		project_id,
	});

	res.json(addToDb);
});

router.post('/createWorkorder/', authorize(), async (req, res) => {
	const {
		created_on,
		created_by,
		deleted,
		rush,
		special_requirements,
		project_id,
		status,
		pipes,
	} = req.body;

	try {
		workorderNameFromProject = await knex(getProjectsDB)
			.select('workorder_id')
			.where({ project_id: project_id });

		getTotalWorkOrdersOnProject = await knex(getWorkordersDB)
			.count('project_id')
			.where({ project_id: project_id })
			.returning('count', 'workorder_name');
		let workorder_id = [];
		if (getTotalWorkOrdersOnProject[0].count !== 0) {
			workorder_id = await knex(postWorkordersDB)
				.insert({
					created_on: created_on,
					created_by_id: created_by,
					deleted: deleted,
					rush: rush,
					special_requirements: special_requirements,
					status: status,
					project_id: project_id,
					purchaser_id: created_by,
					workorder_name: `${workorderNameFromProject[0].workorder_id}-${getTotalWorkOrdersOnProject[0].count}`,
				})
				.returning('*');
		} else {
			workorder_id = await knex(postWorkordersDB)
				.insert({
					created_on: created_on,
					created_by_id: created_by,
					deleted: deleted,
					rush: rush,
					special_requirements: special_requirements,
					status: status,
					project_id: project_id,
					purchaser_id: created_by,
					workorder_name: workorderNameFromProject[0].workorder_id,
				})
				.returning('workorder_id');
		}

		const new_workorder_id = workorder_id[0].workorder_id;

		const formattedPipes = await formatProjectSheetPipes(
			new_workorder_id,
			pipes,
			created_on,
			created_by
		);

		const addWorkorderItemsToDB = await knex(postWorkordersItemsDB).insert(formattedPipes);

		res.statusCode = 202;
		res.json(new_workorder_id);
	} catch (error) {
		console.log(error);
		res.json('addToDb');
	}
});

router.post('/fakeAdd/', async (req, res) => {
	const options = [
		{ value: 133, label: 'Collar' },
		{ value: 134, label: 'Backing Ring' },
		{ value: 1, label: '' },
		{ value: 2, label: '3/8" x 6"' },
		{ value: 3, label: '1/2" x 6"' },
		{ value: 4, label: '3/8" x 7"' },
		{ value: 5, label: '1/2" x 7"' },
		{ value: 6, label: '3/8" x 8"' },
		{ value: 7, label: '1/2" x 8"' },
		{ value: 8, label: '3/8" x 9"' },
		{ value: 9, label: '1/2" x 9"' },
		{ value: 10, label: '3/8" x 10"' },
		{ value: 11, label: '1/2" x 10"' },
		{ value: 12, label: '5/8" x 10"' },
		{ value: 13, label: '3/4" x 10"' },
		{ value: 14, label: '3/8" x 12"' },
		{ value: 15, label: '1/2" x 12"' },
		{ value: 16, label: '5/8" x 12"' },
		{ value: 17, label: '3/4" x 12"' },
		{ value: 18, label: '3/8" x 14"' },
		{ value: 19, label: '1/2" x 14"' },
		{ value: 20, label: '5/8" x 14"' },
		{ value: 21, label: '3/4" x 14"' },
		{ value: 22, label: '3/8" x 16"' },
		{ value: 23, label: '1/2" x 16"' },
		{ value: 24, label: '5/8" x 16"' },
		{ value: 25, label: '3/4" x 16"' },
		{ value: 26, label: '1 x" 16"' },
		{ value: 27, label: '3/8" x 18"' },
		{ value: 28, label: '1/2" x 18"' },
		{ value: 29, label: '5/8" x 18"' },
		{ value: 30, label: '3/4" x 18"' },
		{ value: 31, label: '1 x" 18"' },
		{ value: 32, label: '3/8" x 20"' },
		{ value: 33, label: '1/2" x 20"' },
		{ value: 34, label: '5/8" x 20"' },
		{ value: 35, label: '3/4" x 20"' },
		{ value: 36, label: '1 x" 20"' },
		{ value: 37, label: '3/8" x 22"' },
		{ value: 38, label: '1/2" x 22"' },
		{ value: 39, label: '5/8" x 22"' },
		{ value: 40, label: '3/4" x 22"' },
		{ value: 41, label: '1 x" 22"' },
		{ value: 42, label: '3/8" x 24"' },
		{ value: 43, label: '1/2" x 24"' },
		{ value: 44, label: '5/8" x 24"' },
		{ value: 45, label: '3/4" x 24"' },
		{ value: 46, label: '1 x" 24"' },
		{ value: 47, label: '1/2" x 26"' },
		{ value: 48, label: '5/8" x 26"' },
		{ value: 49, label: '3/4" x 26"' },
		{ value: 50, label: '1 x" 26"' },
		{ value: 51, label: '5/4" x 26"' },
		{ value: 52, label: '1/2" x 28"' },
		{ value: 53, label: '5/8" x 28"' },
		{ value: 54, label: '3/4" x 28"' },
		{ value: 55, label: '1 x" 28"' },
		{ value: 56, label: '5/4" x 28"' },
		{ value: 57, label: '1/2" x 30"' },
		{ value: 58, label: '5/8" x 30"' },
		{ value: 59, label: '3/4" x 30"' },
		{ value: 60, label: '1 x" 30"' },
		{ value: 61, label: '5/4" x 30"' },
		{ value: 62, label: '3/2" x 30"' },
		{ value: 63, label: '1/2" x 32"' },
		{ value: 64, label: '5/8" x 32"' },
		{ value: 65, label: '3/4" x 32"' },
		{ value: 66, label: '1 x" 32"' },
		{ value: 67, label: '5/4" x 32"' },
		{ value: 68, label: '3/2" x 32"' },
		{ value: 69, label: '1/2" x 34"' },
		{ value: 70, label: '5/8" x 34"' },
		{ value: 71, label: '3/4" x 34"' },
		{ value: 72, label: '1 x" 34"' },
		{ value: 73, label: '5/4" x 34"' },
		{ value: 74, label: '3/2" x 34"' },
		{ value: 75, label: '1/2" x 36"' },
		{ value: 76, label: '5/8" x 36"' },
		{ value: 77, label: '3/4" x 36"' },
		{ value: 78, label: '1 x" 36"' },
		{ value: 79, label: '5/4" x 36"' },
		{ value: 80, label: '3/2" x 36"' },
		{ value: 81, label: '1/2" x 38"' },
		{ value: 82, label: '5/8" x 38"' },
		{ value: 83, label: '3/4" x 38"' },
		{ value: 84, label: '1 x" 38"' },
		{ value: 85, label: '5/4" x 38"' },
		{ value: 86, label: '3/2" x 38"' },
		{ value: 87, label: '1/2" x 40"' },
		{ value: 88, label: '5/8" x 40"' },
		{ value: 89, label: '3/4" x 40"' },
		{ value: 90, label: '1 x" 40"' },
		{ value: 91, label: '5/4" x 40"' },
		{ value: 92, label: '3/2" x 40"' },
		{ value: 93, label: '1/2" x 42"' },
		{ value: 94, label: '5/8" x 42"' },
		{ value: 95, label: '3/4" x 42"' },
		{ value: 96, label: '1 x" 42"' },
		{ value: 97, label: '5/4" x 42"' },
		{ value: 98, label: '3/2" x 42"' },
		{ value: 99, label: '1/2" x 44"' },
		{ value: 100, label: '5/8" x 44"' },
		{ value: 101, label: '3/4" x 44"' },
		{ value: 102, label: '1 x" 44"' },
		{ value: 103, label: '5/4" x 44"' },
		{ value: 104, label: '3/2" x 44"' },
		{ value: 105, label: '1/2" x 48"' },
		{ value: 106, label: '5/8" x 48"' },
		{ value: 107, label: '3/4"" x 48"' },
		{ value: 108, label: '1 x" 48"' },
		{ value: 109, label: '5/4" x 48"' },
		{ value: 110, label: '3/2" x 48"' },
		{ value: 111, label: '3/4" x 52"' },
		{ value: 112, label: '1 x" 52"' },
		{ value: 113, label: '5/4" x 52"' },
		{ value: 114, label: '3/2" x 52"' },
		{ value: 115, label: '1 x" 54"' },
		{ value: 116, label: '5/4" x 52"' },
		{ value: 117, label: '3/2" x 54"' },
		{ value: 118, label: '1 x" 60"' },
		{ value: 119, label: '5/4" x 60"' },
		{ value: 120, label: '3/2" x 60"' },
		{ value: 121, label: '1 x" 66"' },
		{ value: 122, label: '5/4" x 66"' },
		{ value: 123, label: '3/2" x 66"' },
		{ value: 124, label: '1 x" 72"' },
		{ value: 125, label: '5/4" x 72"' },
		{ value: 126, label: '3/2" x 72"' },
		{ value: 127, label: '1 x" 78"' },
		{ value: 128, label: '5/4" x 78"' },
		{ value: 129, label: '3/2" x 78"' },
		{ value: 130, label: '1 x" 84"' },
		{ value: 131, label: '5/4" x 84"' },
		{ value: 132, label: '3/2" x 84"' },
	];

	const fieldsToInsert = options.map(({ value, label }) => ({
		id: value,
		helix: label,
		created_by: 614,
		created_on: todayDate(),
	}));

	const pipeOptions = await knex('roterranet.helix_options').insert(fieldsToInsert);

	res.json('pipeOptions');
});
module.exports = router;
