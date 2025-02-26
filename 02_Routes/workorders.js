const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');
const authorize = require('./Authorization/authorization');

const deleteRoute = require('./RouteCreaters/delete');
const postRoute = require('./RouteCreaters/post');
const getRoute = require('./RouteCreaters/get');
const getTableRoute = require('./RouteCreaters/getTable');
const putRoute = require('./RouteCreaters/put');

const database = require('../01_Database/database');
const postWorkordersDB = database.postWorkordersDB;
const getWorkordersDB = database.getWorkordersDB;
const _addworkorderFN = database._addworkorderFN;

const getProjectsDB = database.getProjectsDB;

const getUsersPermissionsDB = database.getUsersPermissionsDB;
const getUsersDB = database.getUsersDB;

const postWorkordersItemsDetailsDB = database.postWorkordersItemsDetailsDB;

const { format } = require('date-fns');
const {
	workorder_request_approval_email,
	workorder_self_approval_email,
	workorder_approval_email,
	workorder_rejected_email,
} = require('../04_Emails/workorder_emails/workorderApprovalRejectEmails');
const { select } = require('../01_Database/connection');
const { postUserNotification } = require('./userNotifications/userNotifications');
const { todayDate } = require('../03_Utils/formatDates');
const today_now = format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

// JOINED ROUTES   ///////////////////////////////////////////////////////////////////////////////////////////////
// WORKORDER ITEMS
router.use('/:id/workorders_items', require('./workorders_items'));
// WORKORDER HEATS
router.use('/:id/heats', require('./workorders_heats'));

// /workorders -> PATCH -> TABLE -> get all workorders paginated
getTableRoute.getTableData(router, getWorkordersDB);

router.get(`/table`, authorize({ workorder_read: true }), async (req, res) => {
	const { start, size, filters, sorting, globalFilter } = req.query;

	const parsedColumnFilters = JSON.parse(filters);
	const parsedColumnSorting = JSON.parse(sorting);

	const paginatedTable = await knex(getWorkordersDB)
		.select(
			'workorder_id',
			'project_id',
			'workorder_name',
			'project_name',
			'customer_name',
			'customer_id',
			'contact_name',
			'contact_id',
			'approved',
			'approved_by_id',
			'approved_by_name',
			'rush',
			'status_name',
			'status',
			'status_bg_color',
			'purchaser_name',
			'purchaser_id',
			'required_date'
		)
		.whereNot({ status: 7 })
		.modify((builder) => {
			if (!!parsedColumnFilters.length) {
				parsedColumnFilters.map((filter) => {
					const { id: columnId, value: filterValue } = filter;
					if (columnId === 'required_date') {
						console.log(filterValue);
						if (!filterValue?.start && !filterValue?.finish) {
							return;
						} else if (!filterValue?.start) {
							builder.where(
								columnId,
								'<=',
								`"${format(new Date(filterValue?.finish), 'yyyy-MM-dd')}"`
							);
						} else if (!filterValue?.finish) {
							builder.where(
								columnId,
								'>=',
								`"${format(new Date(filterValue?.start), 'yyyy-MM-dd')}"`
							);
						} else {
							builder.whereBetween(columnId, [
								`"${format(new Date(filterValue?.start), 'yyyy-MM-dd')} 00:00:00"`,
								`"${format(new Date(filterValue?.finish), 'yyyy-MM-dd')} 20:00:00"`,
							]);
						}
					} else {
						if (Array.isArray(filterValue) && filterValue.length > 0) {
							builder.whereIn(columnId, filterValue);
						} else {
							builder.whereRaw(`${columnId}::text iLIKE ?`, [`%${filterValue}%`]);
						}
					}
				});
			}

			if (!!globalFilter) {
				builder.whereRaw(`${getWorkordersDB}.*::text iLIKE ?`, [`%${globalFilter}%`]);
			}
			if (!!parsedColumnSorting.length) {
				parsedColumnSorting.map((sort) => {
					const { id: columnId, desc: sortValue } = sort;
					const sorter = sortValue ? 'desc' : 'acs';
					builder.orderBy(columnId, sorter);
				});
			}
		})
		.paginate({
			perPage: size,
			currentPage: start,
			isLengthAware: true,
		});

	res.status(200).json(paginatedTable);
});

router.patch('/project/:id', async (req, res) => {
	const { id } = req.params;
	const getWorkOrderTable = await knex(getWorkordersDB).where('project_id', '=', id);
	res.status(202).send({ userData: getWorkOrderTable });
});

/**
 * Function gets total of Piles + overhead cost of workorders
 * @author   Hasan Alghanim
 * @param    {Number} id   			Gets project_id from params
 * @description 						Uses the project_id to search the workorders table and finds all workorders relating to that project_id
 * @description 						Gets the total of all items based on project_id
 * @route  								GET -> /project/stats/:id'
 * @return   {Object} 					Returns total_spent and _total piles
 */

router.get('/project/stats/:id', async (req, res) => {
	const { id } = req.params;
	const rawSql = knex.raw(
		`project_id, SUM(workorder_cost_total_overhead) as total_spent, SUM(workorder_quantity_total) as total_piles`
	);
	const getWorkOrderTable = await knex(getWorkordersDB)
		.select(rawSql)
		.where('project_id', '=', id)
		.groupBy('project_id')
		.returning('*');

	console.log(getWorkOrderTable);
	res.status(202).send(getWorkOrderTable);
});

/**
 * Function Posts new workorders to the DB
 * @author   Hasan Alghanim
 * @param    {Number} values   			Gets project_id from params
 * @description 						Checks the total count of workorders for that Project_id in workorder table
 * @description 						If the count is > 0 The workorder name gets updated to -> workorder_name - count "Ex. 8111XXXX - 1"
 * @route  								POST -> '/'
 * @return   {Object} 					Returns All data of new workorder
 */
router.post('/', async (req, res) => {
	const { values, user_id } = req.body;
	console.log(values);
	try {
		getAmount = await knex(getWorkordersDB)
			.count('project_id')
			.where('project_id', '=', values.project_id)
			.returning('count');

		if (getAmount[0].count !== 0) {
			result = await knex(postWorkordersDB)
				.insert({
					...values,
					workorder_name: `${values.workorder_name}-${getAmount[0].count}`,
				})
				.returning('*');
		} else {
			result = await knex(postWorkordersDB)
				.insert({
					...values,
					workorder_name: values.workorder_name,
				})
				.returning('workorder_id');
		}

		res.statusCode = 202;
		res.json(result[0]);
	} catch (e) {
		console.log(e);
		return res.status(400).send({
			message: 'This is an error!',
			error: e,
		});
	}
});

// /workorders/:id -> GET -> get one workorder item
getRoute.getById(router, getWorkordersDB, 'workorder_id');

// /workorders/:id -> PUT -> edit one workorder
router.put('/:id', async (req, res) => {
	const { id } = req.params;
	const { values, user_id } = req.body;

	// Updated Values
	const editedEntryId = await knex(postWorkordersDB)
		.update(values)
		.where({ workorder_id: id })
		.returning('workorder_id');

	res.json(editedEntryId);
});

router.put('/:id/status', async (req, res) => {
	const { id } = req.params;
	const { values, user_id } = req.body;

	// Gets Workorder prior to edit
	const workorderUpdating = await knex(getWorkordersDB)
		.select('*')
		.where({ workorder_id: values.workorder_id });

	let editedEntryId;

	// Approved Email
	if (values.approved === 1 && workorderUpdating[0].approved !== 1) {
		editedEntryId = await knex(postWorkordersDB)
			.update(values)
			.where({ workorder_id: id })
			.returning('workorder_id');

		const projectManagerEmail = await knex(database.getUsersDB)
			.select('work_email')
			.where({ user_id: workorderUpdating[0].purchaser_id });

		const workorderItemsDetail = await knex(database.getWorkordersItemsDB)
			.select(
				'cost',
				'cost_item_overhead_profit',
				'cost_total_overhead',
				'cost_total_overhead_profit',
				'quantity',
				'pipe_od',
				'pipe_wall',
				'length',
				'helix_1_thickness',
				'helix_2_thickness',
				'helix_3_thickness',
				'helix_4_thickness',
				'helix_1_diameter',
				'helix_2_diameter',
				'helix_3_diameter',
				'helix_4_diameter',
				'helix_1_spacing',
				'helix_2_spacing',
				'helix_3_spacing',
				'driveholesize',
				'driveholespacing1',
				'driveholespacing2',
				'driveholespacing3',
				'comment',
				'workorder_item_description',
				'workorder_id',
				'workorder_item_id'
			)
			.where({ workorder_id: id })
			.andWhere({ deleted: 0 });
		console.log('workorderItemsDetail', workorderItemsDetail);
		workorder_approval_email(
			workorderUpdating[0],
			workorderItemsDetail,
			projectManagerEmail[0].work_email
		);

		// Manu Team
		workorder_approval_email(
			workorderUpdating[0],
			workorderItemsDetail,
			'Manufacturingworkorders@roterra.com'
		);

		// Inserts Items into Item Detail Based on quantity ONCE ITS APPROVED
		workorderItemsDetail.forEach(async (itemEntry) => {
			const { workorder_id, workorder_item_id, quantity } = itemEntry;

			// Array of new items to be inserted into workorders_items_details table
			const array_Workorder_Item_Details = [];
			for (let i = 1; i < quantity + 1; i++) {
				array_Workorder_Item_Details.push({
					workorder_id: workorder_id,
					workorder_item_id,
					workorder_item_detail_line_item: i,
				});
			}
			await knex.insert(array_Workorder_Item_Details).into(postWorkordersItemsDetailsDB);
		});
	}
	// Reject Email
	else if (values.status === 4 && workorderUpdating[0].status !== 4) {
		editedEntryId = await knex(postWorkordersDB)
			.update(values)
			.where({ workorder_id: id })
			.returning('workorder_id');

		const projectManagerEmail = await knex(database.getUsersDB)
			.select('work_email')
			.where({ user_id: workorderUpdating[0].purchaser_id });

		const workorderItemsDetail = await knex(database.getWorkordersItemsDB)
			.select(
				'cost',
				'cost_item_overhead_profit',
				'cost_total_overhead',
				'cost_total_overhead_profit',
				'quantity',
				'pipe_od',
				'pipe_wall',
				'length',
				'helix_1_thickness',
				'helix_2_thickness',
				'helix_3_thickness',
				'helix_4_thickness',
				'helix_1_diameter',
				'helix_2_diameter',
				'helix_3_diameter',
				'helix_4_diameter',
				'helix_1_spacing',
				'helix_2_spacing',
				'helix_3_spacing',
				'driveholesize',
				'driveholespacing1',
				'driveholespacing2',
				'driveholespacing3',
				'comment',
				'workorder_item_description'
			)
			.where({ workorder_id: id });

		workorder_rejected_email(
			workorderUpdating[0],
			workorderItemsDetail,
			projectManagerEmail[0].work_email
		);
	} else {
		// Updated Values
		editedEntryId = await knex(postWorkordersDB)
			.update(values)
			.where({ workorder_id: id })
			.returning('workorder_id');

		getUpdatedWorkorder = await knex(getWorkordersDB)
			.select('*')
			.where({ workorder_id: editedEntryId[0] });

		const users = [];
		users.push(getUpdatedWorkorder[0].purchaser_id);
		users.push(getUpdatedWorkorder[0].project_manager_id);
		users.push(getUpdatedWorkorder[0].created_by_id);

		[...new Set(users)].map((eachUser) => {
			console.log('eachUser', eachUser);
			postUserNotification(
				eachUser,
				'Workorder Status Change',
				`Workorder ${getUpdatedWorkorder[0].workorder_name} is now in ${getUpdatedWorkorder[0].status_name}. Status change by ${getUpdatedWorkorder[0].updated_by_name}`,
				todayDate(),
				`workorders/${getUpdatedWorkorder[0].workorder_id}`,
				'workorder_status'
			);
		});
	}

	res.json(editedEntryId);
});

// /workorders/:id -> DELETE -> delete one workorder item
deleteRoute.deleteRoute(router, postWorkordersDB, today_now, 'workorder_id');

router.put('/workorder/approval', async (req, res) => {
	console.log(req.body);
	const { workorder_id, user_id } = req.body.values;

	let workorderApprovalMessage;

	const requesterEmail = await knex(database.getUsersDB)
		.select('work_email', 'manager')
		.where('user_id', '=', user_id);

	const managerEmail = await knex(database.getUsersDB)
		.select('work_email')
		.where('user_id', '=', requesterEmail[0].manager);

	const requesterWorkEmail = requesterEmail[0].work_email;
	const managerWorkEmail = managerEmail[0].work_email;

	const workorderItemsDetail = await knex(database.getWorkordersItemsDB)
		.select(
			'cost',
			'cost_item_overhead_profit',
			'cost_total_overhead',
			'cost_total_overhead_profit',
			'quantity',
			'pipe_od',
			'pipe_wall',
			'length',
			'helix_1_thickness',
			'helix_2_thickness',
			'helix_3_thickness',
			'helix_4_thickness',
			'helix_1_diameter',
			'helix_2_diameter',
			'helix_3_diameter',
			'helix_4_diameter',
			'helix_1_spacing',
			'helix_2_spacing',
			'helix_3_spacing',
			'driveholesize',
			'driveholespacing1',
			'driveholespacing2',
			'driveholespacing3',
			'comment',
			'workorder_item_description',
			'workorder_id',
			'workorder_item_id'
		)
		.where('workorder_id', '=', workorder_id)
		.andWhere({ deleted: 0 });

	const response2 = await knex(getUsersPermissionsDB)
		.select('workorder_limit_self')
		.where('user_id', '=', user_id);
	const user_workorder_limit = response2[0].workorder_limit_self;

	const response3 = await knex(getWorkordersDB)
		.select(
			'workorder_name',
			'workorder_cost_total_overhead',
			'workorder_cost_total_overhead_profit',
			'project_name',
			'customer_name',
			'purchaser_name',
			'workorder_id',
			'purchaser_id',
			'project_id'
		)
		.where('workorder_id', '=', workorder_id);
	let created_workorder = response3[0];

	const workorder_cost = created_workorder.workorder_cost_total_overhead;
	// CHECK IF USER LIMIT IS ABOVE COST
	if (workorder_cost <= user_workorder_limit) {
		await knex(postWorkordersDB)
			.update({ status: 6, approved: 1, approved_by_id: user_id, approved_on: new Date() })
			.where('workorder_id', '=', workorder_id);
		workorderApprovalMessage = 'Workorder is Approved.';

		// Email to requester if user creating and purchaser are NOT the same
		if (created_workorder.purchaser_id !== user_id) {
			const purchaser_email = await knex(database.getUsersDB)
				.select('work_email')
				.where('user_id', '=', created_workorder.purchaser_id);

			workorder_self_approval_email(
				created_workorder,
				workorderItemsDetail,
				purchaser_email[0].work_email
			);
		}

		// Email to requester Manager
		workorder_self_approval_email(created_workorder, workorderItemsDetail, managerWorkEmail);

		// // goes to manuf Group
		workorder_self_approval_email(
			created_workorder,
			workorderItemsDetail,
			'Manufacturingworkorders@roterra.com'
		);

		// Inserts Items into Item Detail Based on quantity ONCE ITS APPROVED
		workorderItemsDetail.forEach(async (itemEntry) => {
			const { workorder_id, workorder_item_id, quantity } = itemEntry;

			// Array of new items to be inserted into workorders_items_details table
			const array_Workorder_Item_Details = [];
			for (let i = 1; i < quantity + 1; i++) {
				array_Workorder_Item_Details.push({
					workorder_id: workorder_id,
					workorder_item_id,
					workorder_item_detail_line_item: i,
				});
			}
			await knex.insert(array_Workorder_Item_Details).into(postWorkordersItemsDetailsDB);
		});
	}
	//SEND APPROVAL
	else {
		await knex(postWorkordersDB).update({ status: 5 }).where('workorder_id', '=', workorder_id);

		// Get Manger ID
		const response1 = await knex(getUsersDB).select('manager').where('user_id', '=', user_id);
		const manager_id = response1[0].manager;

		// Find manager approval limit
		const response2 = await knex(getUsersPermissionsDB)
			.select('workorder_limit_other')
			.where('user_id', '=', manager_id);
		const workorder_limit_other = response2[0].workorder_limit_other;

		// Manager Limit > PO total cost
		if (parseFloat(workorder_limit_other) > workorder_cost) {
			const response3 = await knex(getUsersDB).select('*').where('user_id', '=', manager_id);
			const manager_info = response3[0];
			// console.log('made it', manager_info);

			workorderApprovalMessage = `Workorder is over your approval limit and requires approval.\n\nYou will be notified by e-mail when your Workorder is approved.\n\n Your order is being approved by ${manager_info.first_name} ${manager_info.last_name}. \n\nThanks`;

			workorder_request_approval_email(
				created_workorder,
				workorderItemsDetail,
				managerWorkEmail
			);
		}

		// Manager Limit Not High Enough => Find that Manager's Manager PO Limit
		else {
			return recursiveFindManagerWithWorkorderLimit(manager_id, workorder_cost);
		}
	}
	res.status(202).send({ message: workorderApprovalMessage });
});

router.get(`/:id/exceldata`, async (req, res) => {
	const { id } = req.params;
	console.log(id);
	const excelData = await knex(database.getWorkordersItemsDetailsDB)
		.select(
			'workorder_item_detail_name',
			'pipe_od',
			'pipe_wall',
			'pipe_length',
			'helix_1_thickness',
			'helix_2_thickness',
			'helix_3_thickness',
			'helix_4_thickness',
			'helix_1_diameter',
			'helix_2_diameter',
			'helix_3_diameter',
			'helix_4_diameter',
			'shop_approved_name',
			'shop_approved_on',
			'pipe_approved_name',
			'pipe_approved_on',
			'pipe_pipe_heat',
			'pipe_splice_heat',
			'welder_ids',
			'workorder_item_description'
		)
		.where({ workorder_id: id })
		.orderBy('workorder_item_id', 'asc')
		.orderBy('workorder_item_detail_id', 'asc');

	res.json(excelData);
});

module.exports = router;

const recursiveFindManagerWithWorkorderLimit = async (user_id, workorder_total_cost) => {
	// Get Manger ID
	const response1 = await knex(getUsersDB).select('manager').where('user_id', '=', user_id);
	const manager_id = response1[0].manager;

	// Find manager approval limit
	const response2 = await knex(getUsersPermissionsDB)
		.select('workorder_limit_other')
		.where('user_id', '=', manager_id);
	const manager_po_limit_other = response2[0].workorder_limit_other;

	if (parseFloat(manager_workorder_limit_other) > workorder_total_cost) {
		const response3 = await knex(getUsersDB).select('*').where('user_id', '=', manager_id);
		const manager_info = response3[0];
		// console.log('made it', manager_info);
		return manager_info;
	} else {
		return recursiveFindManagerWithWorkorderLimit(manager_id, workorder_total_cost);
	}
};

router.get('/test/test/:id', async (req, res) => {
	const { id } = req.params;

	// Updated Values
	const items = await knex(database.getWorkordersItemsDB)
		.select(
			'workorder_item_id',
			'pipe_od',
			'pipe_wall',
			'length',
			'quantity',
			'helix_1_thickness',
			'helix_1_diameter'
		)
		.where({ workorder_id: id })
		.andWhere({ deleted: 0 })
		.orderBy('workorder_item_line_item', 'asc');

	const itemsDetail = await knex(database.getWorkordersItemsDetailsDB)
		.select(
			'workorder_item_detail_name',
			'pipe_od',
			'pipe_wall',
			'pipe_length',
			'pipe_pipe_heat',
			'helix_1_heat',
			'helix_2_heat',
			'helix_3_heat',
			'helix_4_heat',
			'helix_1_thickness',
			'helix_1_diameter',
			'helix_2_diameter',
			'helix_3_diameter',
			'helix_4_diameter',
			'shop_approved_name',
			'shop_approved_on',
			'workorder_item_id',
			'workorder_item_description',
			'pipe_splice_heat',
			'welder_ids'
		)
		.where({ workorder_id: id })
		.orderBy('workorder_item_line_item', 'asc')
		.orderBy('workorder_item_detail_id', 'acs');

	const allItems = [];

	for (let i = 0; i < items.length; i++) {
		let insertedAmount = 0;
		let jIndexTracker = 0;
		while (insertedAmount < items[i].quantity || jIndexTracker <= itemsDetail.length - 1) {
			String.prototype.replaceBetween = function (start, end, what) {
				return this.substring(0, start) + what + this.substring(end);
			};

			if (items[i].workorder_item_id === itemsDetail[jIndexTracker].workorder_item_id) {
				const locationOfP =
					itemsDetail[jIndexTracker].workorder_item_detail_name.indexOf('P');
				const name = itemsDetail[jIndexTracker].workorder_item_detail_name.replaceBetween(
					locationOfP,
					itemsDetail[jIndexTracker].workorder_item_detail_name.length,
					`P${i + 1}-${insertedAmount + 1}`
				);
				allItems.push({
					...itemsDetail[jIndexTracker],
					lineItemNumber: i + 1,
					itemIndex: insertedAmount + 1,
					workorder_item_detail_name: name,
				});
				insertedAmount++;
			}
			jIndexTracker++;
		}
		insertedAmount = 0;
	}

	res.json(itemsDetail);
});
