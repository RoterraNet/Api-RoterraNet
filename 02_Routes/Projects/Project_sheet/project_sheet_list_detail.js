const express = require('express');
const {
	getProjectSheetItemListDB,
	postProjectSheetItemListDetailsDB,
	getProjectSheetItemListDetailsDB,
} = require('../../../01_Database/database');
const router = express.Router();
const knex = require('../../../01_Database/connection');
const authorize = require('../../Authorization/authorization');

router.get('/get_sheet_list_detail/:project_id', async (req, res) => {
	const { project_id } = req.params;
	const { start, size, deleted } = req.query;
	console.log(req.query);

	try {
		const listOfSheetItems = await knex(getProjectSheetItemListDetailsDB)
			.select(
				'id',
				'project_sheet_item_list_id',
				'hp_num',
				'compression_load',
				'lateral_load',
				'tension_load',
				'pile_type',
				'helix_1',
				'helix_2',
				'helix_3',
				'helix_4',
				'pile_length',
				'min_embedment_depth',
				'min_torque',
				'item_number',
				'support_number',
				'installed_torque',
				'installed_by',
				'installed_on',
				'notes',
				'deleted_item',
				'batter_angle',
				'predrilled_on',
				'predrilled_by',
				'predrilled_depth',
				'deleted'
			)
			.where({ project_id: project_id })
			.andWhere({ deleted: deleted })
			.orderBy('item_number', 'asc')
			.paginate({
				perPage: size,
				currentPage: start,
				isLengthAware: true,
			});

		res.json(listOfSheetItems);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: 'something went wrong,', error: error });
	}
});

router.get('/get_hp_options/:project_id', authorize(), async (req, res) => {
	const { project_id } = req.params;

	try {
		const listOfSheetItems = await knex(getProjectSheetItemListDB)
			.select('hp_num', 'id')
			.where({ project_id: project_id })
			.andWhere({ deleted: false })
			.orderByRaw('LENGTH(hp_num)')
			.orderBy('hp_num', 'asc');
		res.json(listOfSheetItems);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: 'something went wrong,', error: error });
	}
});

router.put('/build_list/', authorize(), async (req, res) => {
	const { project_id } = req.body;
	console.log('build');
	try {
		const listOfSheetItems = await knex(getProjectSheetItemListDB)
			.select('id', 'project_id', 'count')
			.andWhere({ project_id: project_id })
			.andWhere({ deleted: false });

		let item_number = 1;
		for (let i = 0; i < listOfSheetItems.length; i++) {
			for (let j = 0; j < listOfSheetItems[i].count; j++) {
				const insertArray = {
					project_id: listOfSheetItems[i].project_id,

					item_number: item_number,
				};
				const listOfSheetItemsDetail = await knex(postProjectSheetItemListDetailsDB).insert(
					{
						...insertArray,
						created_on: new Date(),
					}
				);
				item_number++;
			}
		}

		res.json('listOfSheetItems');
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: 'something went wrong,', error: error });
	}
});

router.put('/update_up/', authorize(), async (req, res) => {
	const { id, update } = req.body;

	try {
		const updateHpNum = await knex(postProjectSheetItemListDetailsDB)
			.update({ ...update })
			.where({ id: id });

		res.json(updateHpNum);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: 'something went wrong,', error: error });
	}
});

router.put('/deleteRow/', authorize(), async (req, res) => {
	const { id, update } = req.body;

	try {
		const deleteRow = await knex(postProjectSheetItemListDetailsDB)
			.update({ ...update })
			.where({ id: id });

		res.json(deleteRow);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: 'something went wrong,', error: error });
	}
});

module.exports = router;
