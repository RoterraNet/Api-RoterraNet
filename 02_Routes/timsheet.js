const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');
const differenceInMinutes = require('date-fns/differenceInMinutes');
var parseISO = require('date-fns/parseISO');
var _ = require('lodash');

// const data = {user_id: 1,
//     first_name: "Jimmy",
//     last_name: "Bob",
//     position_name: "Welder",
//     station_name: "Welding Station 1",
//     station_id: 1,
//     task_name: "Welding",
//     task_id: 2,
//     equipment_name: "sledge hammer",
//     equipment_id: 3,
//     start_day: Date.now(),
//     end_day: null,
//     active_job_start_time: Date.now(),
//     active_timesheets: [{workorder_id: 3,  Line: 1, workorder: "81135678-1", Quantity: 169, length: '8"', pipe: '4" 1/2 (0.29)	', helix1: "1/2 X 16'", helix2: "1/2 X 16'", helix3: "1/2 X 16'", helix4: "1/2 X 16'", other: "CCMC", Cut: 75, Welded: 75, QC: 75},
//                  {workorder_id: 4,  Line: 1, workorder: "81135678-1", Quantity: 169, length: '8"', pipe:'4" 1/2 (0.29)	', helix1: "1/2 X 16'", helix2: "1/2 X 16'", helix3: "1/2 X 16'", helix4: "1/2 X 16'", other: "CCMC", Cut: 75, Welded: 75, QC: 75}
//                 ]
// }

// get days -> open by user id
router.get('/', async (req, res) => {
	let open_timesheets;
	if (req.query.view === 'dashboard') {
		open_timesheets = await knex
			.select(
				'users.user_id',
				'users.first_name',
				'users.last_name',
				'users.position',
				'timesheets.id AS timesheet_id',
				'timesheets.start_day',
				'timesheets.end_day',
				'timesheets.task_id',
				'timesheets.equipment_id',
				'timesheets.active_job_start_time'
				//   "positions.position_name",
				//   "shop_tasks.id AS shop_task_id","shop_tasks.task_name",
				//   "shop_station.id AS shop_station_id", "shop_station.station_name",
				//   "equipment.make_model AS equipment_name"
			)
			.from('roterranet.users')
			.andWhere('users.company', '=', 2)
			.andWhere('users.deleted', '=', 0)
			.leftJoin('roterranet.timesheets', 'users.user_id', 'timesheets.user_id')
			.leftJoin('roterranet.positions', 'users.position', 'positions.position_id')
			.leftJoin('roterranet.shop_tasks', 'timesheets.task_id', 'shop_tasks.id')
			.leftJoin('roterranet.shop_station', 'timesheets.station_id', 'shop_station.id')
			.leftJoin('roterranet.equipment', 'timesheets.equipment_id', 'equipment.id')
			// .whereNull('timesheets.end_day')
			.orderBy('users.first_name', 'ASC');
	}

	res.json({ open_timesheets: open_timesheets });
});

// get days -> open by user id
// router.get('params-> ?view=open&user_id:1', async (req, res) => {

//     const open_timesheets = await knex('roterranet.timesheets').whereNull('date_end') ///!!! get timesheets with project name number and line item name number
//     let open_timesheets_by_user_id = {}

//     // create a hash table to get timesheet organized by user_id
//     openTimesheets.forEach(timesheet => {
//         if(open_timesheets_by_user_id[timesheet.user_id]) {
//             open_timesheets_by_user_id[timesheet.user_id].push({id: timesheet.id, project_id: timesheet.project_id})
//         } else {
//             open_timesheets_by_user_id[timesheet.user_id] = timesheet.user_id
//             open_timesheets_by_user_id[timesheet.user_id] = [{id: timesheet.id, project_id: timesheet.project_id}]
//         }
//     })

//     res.json({open_timesheets: open_timesheets_by_user_id})
// });

// start new day
router.post('/', async (req, res) => {
	// const { start_day, user_id } = req.body;

	// const response = await knex('roterranet.timesheets').insert({user_id: user_id, start_day: start_day}).returning("id")

	res.json({ hi: 'hi' });
});

router.get('/:ts_id', async (req, res) => {
	const { ts_id } = req.params;

	const response = await knex
		.select('timesheets_details.workorder_id AS timesheet_details_id', 'timesheets_details.workorder_line_id AS workorder_line_id')
		.from('roterranet.timesheets')
		.leftJoin('roterranet.timesheets_details', 'timesheets_details.timesheet_id', 'timesheets.id')
		.where('timesheets_details.timesheet_id', '=', ts_id);

	const count_query = (search, count_name, workorder_line_id) => {
		return knex.from('roterranet.pile').leftJoin('roterranet.pile_detail', 'pile_detail.pile_id', 'pile.id').where('pile.id', '=', workorder_line_id).count(search, { as: count_name });
	};

	const response2 = response.map(async (timesheet) => {
		let workorder_info = knex
			.from('roterranet.workorders')
			.select(
				'workorders.id AS workorder_id',
				'workorders.workorder_id AS workorder_name',
				'pile.id AS pile_id',
				'pile.quantity',
				'pile.length',
				'pile.comment AS other',
				'pile.line_item_desc AS pile_desc',
				'pipe.od AS pipe_od',
				'pipe.wall AS pipe_wall',
				'h1.thickness AS helix_1_thickness',
				'pile.helix_1_diameter',
				'h2.thickness AS helix_2_thickness',
				'pile.helix_2_diameter',
				'h3.thickness AS helix_3_thickness',
				'pile.helix_3_diameter',
				'h4.thickness AS helix_4_thickness',
				'pile.helix_4_diameter'
			)
			.leftJoin('roterranet.pile', 'roterranet.workorders.id', 'pile.workorder_id')
			.leftJoin('roterranet.pipe', 'pipe.id', 'pile.pipe')
			.leftJoin({ h1: 'roterranet.plate' }, 'h1.id', 'pile.helix_1_thickness')
			.leftJoin({ h2: 'roterranet.plate' }, 'h2.id', 'pile.helix_2_thickness')
			.leftJoin({ h3: 'roterranet.plate' }, 'h3.id', 'pile.helix_3_thickness')
			.leftJoin({ h4: 'roterranet.plate' }, 'h4.id', 'pile.helix_4_thickness')
			.where('pile.id', '=', timesheet.workorder_line_id);

		let cut_count_info = count_query('shopapprovedid', 'cut', timesheet.workorder_line_id);
		let weld_count_info = count_query('weldedpersonid', 'welded', timesheet.workorder_line_id);
		let qc_count_info = count_query('pipeapprovedid', 'qc', timesheet.workorder_line_id);
		let all_data = Promise.all([workorder_info, cut_count_info, weld_count_info, qc_count_info]);
		return all_data;
	});

	const response3 = await Promise.all(response2);

	let nice_Data = [];
	for (let i = 0; i < response3.length; i++) {
		let data = [];
		for (let j = 0; j < 4; j++) {
			data.push(response3[i][j][0]);
		}

		nice_Data.push(_.merge({}, ...data));
	}

	res.json(nice_Data);
});

// end day
router.patch('/:ts_id', async (req, res) => {
	const { end_day } = req.body;
	const { ts_id } = req.params;
	const response = await knex.select('start_day').from('roterranet.timesheets').where({ id: ts_id }).whereNull('end_day');

	const total_time_min = parseFloat(differenceInMinutes(parseISO(end_day), response[0].start_day));
	const total_time_hours = Math.round((total_time_min / 60) * 10000) / 10000;

	const user_id = await knex('roterranet.timesheets').where({ id: ts_id }).whereNull('end_day').update({ end_day: end_day, total_hours: total_time_hours }).returning('user_id');

	const new_timesheet_id = await knex('roterranet.timesheets').insert({ user_id: user_id[0] });

	res.json(response3);
});

// edit day -> ie approve it -> combine with previous
router.patch('/:ts_id', async (req, res) => {});

// delete day ->
router.delete('/:ts_id', async (req, res) => {});

// get all timesheets associated with this day
router.get('/:ts_id/entry', async (req, res) => {
	user_id = req.params.id;

	res.json({ dog: 'dog' });
});

// start new timesheet
router.post('/:ts_id/entry', async (req, res) => {
	const { user_id, active_job_start_time, station_id, task_id, shop_equipment_id, userTimesheets } = req.body;
	const { ts_id } = req.params;

	// fill wo_info array with workorder information (10 null - 5 potential workorder and 5 line entries) -> then put it in the query
	new_timesheets = [];
	userTimesheets.forEach((timesheet) => {
		let insert_timesheet = {
			timesheet_id: ts_id,
			user_id: user_id,
			start_time: active_job_start_time,
			station_id: station_id,
			task_id: task_id,
			equipment_id: shop_equipment_id,
			workorder_id: timesheet.workorder_id,
			workorder_line_id: timesheet.pile_id,
		};
		new_timesheets.push(insert_timesheet);
	});

	const inserted2 = await knex('roterranet.timesheets').where({ id: ts_id }).whereNull('end_day').update({ active_job_start_time: active_job_start_time, task_id: task_id, equipment_id: shop_equipment_id, station_id: station_id });
	const inserted = await knex('roterranet.timesheets_details').insert(new_timesheets);

	res.json(inserted);
});

// end timesheet per workorder entry
router.patch('/:ts_id/entry', async (req, res) => {
	const { end_time } = req.body;
	const { ts_id } = req.params;

	const num_open_job_timesheets = await knex('roterranet.timesheets_details').where({ timesheet_id: ts_id }).whereNull('end_time').count();
	const start_time = await knex('roterranet.timesheets_details').where({ timesheet_id: ts_id }).whereNull('end_time').first('start_time');

	const total_time_min = parseFloat(differenceInMinutes(start_time.start_time, parseISO(end_time)));
	const total_time_per_job_hours = Math.round((total_time_min / (num_open_job_timesheets[0].count * 60)) * 10000) / 10000;

	const update_timesheet_details = await knex('roterranet.timesheets_details').where({ timesheet_id: ts_id }).whereNull('end_time').update({ end_time: end_time, hours: total_time_per_job_hours });
	const update_timesheets = await knex('roterranet.timesheets').where({ id: ts_id }).whereNull('end_day').update({ active_job_start_time: null });

	res.json({ status: 'Success' });
});

// edit individual timesheet!!!
router.patch('/:ts_id/entry/:id', async (req, res) => {});

// delete individual timesheet!!!
router.delete('/:ts_id/timesheet/:id', async (req, res) => {});

// start day
router.post('/:user_id/workorder', async (req, res) => {
	const { user_id, start_time, workorders } = req.body;

	await knex('roterranet.timesheets').insert({ user_id: user_id, start_time: start_time });
});

// total_hours task_id equipment_id workorder_id1	wwo_info[]orkorder_line_id1	workorder_id2	wwo_info[]orkorder_line_id2	workorder_id3	wwo_info[]orkorder_line_id3	workorder_id4	wwo_info[]orkorder_line_id4	workorder_id5	wwo_info[]orkorder_line_id5
// id 	user_id	start_time end_time

// Timesheet POST {timesheets.userId, {projects: [1,2,3,4]}, timesheets.workorderId, timesheets.equipmentId, timesheets.dateStart}

// await knex('roterranet.timesheet_details').where({user_id: user_id}).whereNull("end_time").update({active_job_start_time: active_job_start_time, task_id: task_id, equipment_id: equipment_id, workorder_id1: wo_info[0], workorder_line_id1: wo_info[1], workorder_id2: wo_info[2], workorder_line_id2: wo_info[3],workorder_id3: wo_info[4], workorder_line_id3: wo_info[5], workorder_id4: wo_info[6], workorder_line_id4: wo_info[7], workorder_id5: wo_info[8], workorder_line_id5: wo_info[9]})

// Select all active USERS, PROJECTS, SHOP STATIONS and SHOP TASKS
// router.get('?view=dashboard', async (req, res) => {

//     // sql = "SELECT user_id, first_name, last_name FROM roterranet.users WHERE company = 2 and deleted = 1
//     const userData = await knex.select("user_id", "first_name", "last_name").from("roterranet.users").where("company", 2).andWhere("deleted", 0).orderBy("first_name")

//     // sql = SELECT workorders.workorder_id, workorders.id as workorder_pk, workorders.project_id as project_id, project.project as project_name, customer.name
//     //       FROM roterranet.workorders
//     //       LEFT JOIN roterranet.project on workorders.project_id = project.id
//     //       LEFT JOIN roterranet.customer on customer.customer_id = project.customer
//     //       WHERE workorders.status = 2 ORDER BY project_id DESC
//     const projectData = await knex.select("workorders.workorder_id","workorders.id as workorder_pk", "workorders.project_id as project_id", "project.project as project_name", "customer.name as customer")
//     .from("roterranet.workorders")
//     .leftJoin("roterranet.project","workorders.project_id","project.id")
//     .leftJoin("roterranet.customer","customer.customer_id","project.customer")

//     .where("workorders.status", 2)
//     // orderBy("workorders.id", "desc")

//     // sql = SELECT id, station_name FROM roterranet.shop_station
//     const shopStationData = await knex.select("id", "station_name").from("roterranet.shop_station")

//     // sql = SELECT id, task_name FROM roterranet.shop_tasks
//     const taskData = await knex.select("id", "task_name").from("roterranet.shop_tasks")
//     res.json({projectData: projectData, userData: userData, shopStationData: shopStationData, taskData: taskData})

// });

// get days -> open by user id
// router.get('params-> ?view=open&user_id:1', async (req, res) => {

//     const open_timesheets = await knex('roterranet.timesheets').whereNull('date_end') ///!!! get timesheets with project name number and line item name number
//     let open_timesheets_by_user_id = {}

//     // create a hash table to get timesheet organized by user_id
//     openTimesheets.forEach(timesheet => {
//         if(open_timesheets_by_user_id[timesheet.user_id]) {
//             open_timesheets_by_user_id[timesheet.user_id].push({id: timesheet.id, project_id: timesheet.project_id})
//         } else {
//             open_timesheets_by_user_id[timesheet.user_id] = timesheet.user_id
//             open_timesheets_by_user_id[timesheet.user_id] = [{id: timesheet.id, project_id: timesheet.project_id}]
//         }
//     })

//     res.json({open_timesheets: open_timesheets_by_user_id})
// });

// router.post('/get-user-timsheet', async (req, res) => {
//     var currentDate = new Date();

//     insertedTimesheets.forEach(ts => {
//         knex('roterranet.timesheets').insert({user_id: ts.userId, project_id: ts.projectId, workorder_id: ts.workorderId, equipment_id: ts.equipmentId, date_start: currentDate})
//     });
//     // sql = "SELECT user_id, first_name, last_name FROM roterranet.users WHERE company = 2 and deleted = 1
//     const user_info = await knex.select("user_id", "first_name", "last_name").from("roterranet.users").where("company", 2).andWhere("deleted", 0).orderBy("first_name")

//     res.json({userData: user_info})

// });

// router.post('/end-timsheet', async (req, res) => {

//     // finalDate and hours missing

//     knex('roterranet.timesheets').where({user_id: userID}).WhereNull('date_end').update({hours: hours, date_end: finalDate})
//     res.json({userData: user_info})

// });

// // get all timesheet information between that matches criteria
// router.get('/allentries', async (req, res) => {
//     var currentDate = new Date();

//     insertedTimesheets.forEach(timesheet => {
//         knex('roterranet.timesheets').insert({user_id: userId, project_id: projectId, workorder_id: workorderId, equipment_id: equipmentId, date_start: currentDate})
//     });

//     res.json({userData: user_info})
// });

module.exports = router;
