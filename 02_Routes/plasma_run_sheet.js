const express = require('express');

const knex = require('../01_Database/connection');
const router = express.Router();
const database = require('../01_Database/database');
const { todayDate } = require('../03_Utils/formatDates');
const SearchBuilder = require('./RouteCreaters/RouteHelpers/SearchBuilder');
const { postUserNotification } = require('../02_Routes/userNotifications/userNotifications');
const subMonths = require('date-fns/subMonths');
const format = require('date-fns/format');
const { includes } = require('lodash');

const sixMonthAgo = format(subMonths(new Date(), 6), 'yyyy-MM-dd');

const getPlasmaRunSheetsDB = database.getPlasmaRunSheetsDB;
const postPlasmaRunSheetsDB = database.postPlasmaRunSheetsDB;
const getPlasmaRunSheetItemsDB = database.getPlasmaRunSheetItemsDB;
const postPlasmaRunSheetItemsDB = database.postPlasmaRunSheetItemsDB;
const getWorkorderDB = database.getWorkordersDB;

const getPlasma_run_sheet_helix_sizesDB = database.getPlasma_run_sheet_helix_sizesDB;
const getPlasma_run_sheet_sizesDB = database.getPlasma_run_sheet_sizesDB;

router.get(`/table`, async (req, res) => {
	const page = req.query.page;
	const perPage = req.query.perPage;

	const search = Object.keys(JSON.parse(req.query.search));
	const newArrayCleaned = [];

	search.map((each) => {
		const parsedObj = JSON.parse(req.query.search)[each];
		parsedObj.filterBy !== '' && newArrayCleaned.push(parsedObj);
	});

	const paginatedTable = await knex(getPlasmaRunSheetsDB)
		.select(
			'id',
			'sheet_name',
			'thickness_name',
			'sheet_length',
			'sheet_width',
			'created_on',
			'completed',
			'rush'
		)
		.modify((builder) => {
			SearchBuilder(newArrayCleaned, builder);
		})
		.orderBy('completed', 'desc')
		.orderBy('id', 'desc')
		.where({ deleted: false })
		// .distinctOn('id')

		.paginate({
			perPage: perPage,
			currentPage: page,
			isLengthAware: true,
		});
	const ids = [];
	paginatedTable.data.map((each) => {
		ids.push(each.id);
	});

	const itemList = await knex(getPlasmaRunSheetItemsDB)
		.select('plasma_run_sheet_id', 'workorder_name')
		.whereIn('plasma_run_sheet_id', ids)
		.whereNotNull('workorder_name');

	paginatedTable.data.map((each) => {
		each.workorders = [];
		itemList.map((eachItem) => {
			if (
				eachItem.plasma_run_sheet_id === each.id &&
				!each.workorders.includes(eachItem.workorder_name)
			) {
				each.workorders.push(eachItem.workorder_name);
			}
		});
	});

	res.json(paginatedTable);
});

router.get('/:id/sheet', async (req, res) => {
	const { id } = req.params;
	const itemList = await knex(getPlasmaRunSheetsDB).select('*').where({ id: id });
	res.json(itemList);
});

router.get('/:id/items', async (req, res) => {
	const { id } = req.params;
	const itemList = await knex(getPlasmaRunSheetItemsDB)
		.select('*')
		.where({ plasma_run_sheet_id: id })
		.orderBy('id', 'asc');

	res.json(itemList);
});

router.put('/sheet', async (req, res) => {
	try {
		const { values } = req.body;
		console.log(values);

		const updatedData = await knex(postPlasmaRunSheetsDB)
			.update(values.update)
			.where({ id: values.id });

		res.json({ msg: 'Plasma Sheet  were updated', color: 'success' });
	} catch (error) {
		console.log(error);
		res.json({ msg: 'Something Went Wrong', color: 'danger' });
	}
});

router.put('/sheet/complete', async (req, res) => {
	try {
		const { values } = req.body;

		const updatedData = await knex(postPlasmaRunSheetsDB)
			.update(values.update)
			.where({ id: values.id })
			.returning('*');

		// gets  list of users to send notification to
		const usersListToNotify = await knex('roterranet.view_users_permissions')
			.select('user_id')
			.where({ manufacturing: true })
			.andWhere({ deleted: 0 });

		// send Notification
		usersListToNotify.forEach(({ user_id }) => {
			postUserNotification(
				user_id,
				'Plasma Sheet Completed',
				`Plasma Sheet ${updatedData[0].sheet_name} has been completed`,
				todayDate(),
				`plasmarunsheets/${updatedData[0].id}`,
				'plasma_run_sheet'
			);
		});

		res.json({ msg: 'Plasma Sheet  were updated', color: 'success' });
	} catch (error) {
		console.log(error);
		res.json({ msg: 'Something Went Wrong', color: 'danger' });
	}
});

router.put('/items', async (req, res) => {
	try {
		const { values } = req.body;

		const updatedData = await knex(postPlasmaRunSheetItemsDB)
			.update(values.update)
			.where({ id: values.id });
		res.json({ msg: 'Plasma Sheet Items were updated', color: 'success' });
	} catch (error) {
		res.json({ msg: 'Something Went Wrong', color: 'danger' });
	}
});

router.post('/sheet', async (req, res) => {
	try {
		const { values } = req.body;

		const postSheet = await knex(postPlasmaRunSheetsDB).insert({ ...values });
		res.json({ msg: 'Plasma Sheet Items were added', color: 'success' });
	} catch (error) {
		res.json({ msg: 'Something Went Wrong', color: 'danger' });
	}
});

router.post('/items', async (req, res) => {
	try {
		const { values } = req.body;

		const fieldsToInsert = values.arrayOfItems.map((item) => ({
			created_by: values.created_by,
			created_on: values.created_on,
			plasma_run_sheet_id: values.plasma_run_sheet_id,
			od: item.od,
			size: item.size.id === '' ? null : item.size.id,
			type: item.type.value,
			extra_detail: item.extra_detail,
			projected_qty: item.projected_qty,
			total_required: item.total_required,
			total_cut: item.total_cut,
			workorder_id:
				item.workorder_id.workorder_id === '' ? null : item.workorder_id.workorder_id,
			length: item.length,
			width: item.width,
		}));

		const itemList = await knex(postPlasmaRunSheetItemsDB).insert(fieldsToInsert);
		res.json({ msg: 'Plasma Sheet Items were added', color: 'success' });
	} catch (error) {
		console.log(error);
		res.json({ msg: 'Something Went Wrong', error: error, color: 'danger' });
	}
});

router.get('/optionsList', async (req, res) => {
	const workordersList = await knex(getWorkorderDB)
		.select('workorder_id', 'workorder_name')
		.whereNotNull('workorder_name')
		.orderBy('workorder_name', 'desc')
		.limit(500);

	const idSizeList = await knex(getPlasma_run_sheet_helix_sizesDB)
		.select('id', 'name')
		.orderBy('decimal', 'acs');

	const sheetSizeList = await knex(database.getPlatesDB)
		.select('thickness as size', 'id')
		.orderBy('sortorder', 'asc');

	res.json({
		workorderList: workordersList,
		idSizeList: idSizeList,
		sheetSizeList: sheetSizeList,
	});
});

router.get('/heatOptions/', async (req, res) => {
	try {
		const { plateId } = req.query;
		const getAllEntry = await knex(database.getWorkordersHeatsDB)
			.select('heat')
			.where({ plate: plateId })
			.andWhereBetween('created_on', [sixMonthAgo, format(new Date(), 'yyyy-MM-dd')])
			.orderBy('id', 'desc');

		res.json(getAllEntry);
	} catch (error) {
		res.send({ error: error, msg: 'Something Went Wrong. Check Error' });
	}
});

router.post('/clone', async (req, res) => {
	try {
		const { values } = req.body;

		const sheetDetail = await knex(getPlasmaRunSheetsDB)
			.select(
				'sheet_name',
				'sheet_thickness',
				'sheet_length',
				'sheet_width',
				'program_name',
				'cut_off',
				'plate_utilization'
			)
			.where({ id: values.sheet_id });

		const sheetItems = await knex(getPlasmaRunSheetItemsDB)
			.select(
				'od',
				'helix_size_id',
				'type',
				'extra_detail',
				'projected_qty',
				'total_required',
				'total_cut',
				'workorder_id',
				'length',
				'width'
			)
			.where({ plasma_run_sheet_id: values.sheet_id })
			.orderBy('id', 'asc');

		for (let i = 0; i < parseInt(values.amount); i++) {
			const postSheet = await knex(postPlasmaRunSheetsDB)
				.insert({
					...sheetDetail[0],
					created_on: new Date(),
					created_by: values.created_by,
				})
				.returning('id');

			const itemsToInsert = sheetItems.map((item) => ({
				created_on: new Date(),
				created_by: values.created_by,
				plasma_run_sheet_id: postSheet[0],
				od: item.od,
				size: item.helix_size_id,
				type: item.type,
				extra_detail: item.extra_detail,
				projected_qty: item.projected_qty,
				total_required: item.total_required,
				total_cut: item.total_cut,
				workorder_id: item.workorder_id,
				length: item.length,
				width: item.width,
			}));

			const itemList = await knex(postPlasmaRunSheetItemsDB).insert(itemsToInsert);
		}

		res.json({ msg: 'Plasma Sheet Items were added', color: 'success' });
	} catch (error) {
		console.log(error);
		res.json({ msg: 'Something Went Wrong', error: error, color: 'danger' });
	}
});

module.exports = router;
