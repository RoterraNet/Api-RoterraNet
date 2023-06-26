const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');
const XLSX = require('xlsx');
var nodeExcel = require('excel-export');
const authorize = require('./Authorization/authorization');

router.get('/', async (req, res) => {
	res.render('Index');
});

router.get('/doggy', async (req, res) => {
	let data = [
		{
			user_id: 1,
			first_name: 'Jimmy',
			last_name: 'Bob',
			position_name: 'Welder',
			station_name: 'Welding Station 1',
			task_name: 'Welding',
			start_time: Date.now(),
			end_time: null,
			timesheets: [
				{
					workorder_id: 3,
					workorder: '81135678-1',
					Line: 1,
					Quantity: 169,
					helix1: "1/2 X 16'",
					helix2: "1/2 X 16'",
					helix3: "1/2 X 16'",
					helix4: "1/2 X 16'",
					other: 'CCMC',
					Cut: 75,
					Welder: 75,
					QC: 75,
				},
				{
					workorder_id: 4,
					workorder: '81135678-1',
					Line: 1,
					Quantity: 169,
					helix1: "1/2 X 16'",
					helix2: "1/2 X 16'",
					helix3: "1/2 X 16'",
					helix4: "1/2 X 16'",
					other: 'CCMC',
					Cut: 75,
					Welder: 75,
					QC: 75,
				},
			],
		},
		{
			user_id: 2,
			first_name: 'James',
			last_name: 'Bob',
			Job: 'Welder',
			position_name: 'Welder',
			station_name: 'Welding Station 1',
			task_name: 'Welding',
			start_time: Date.now(),
			end_time: Date.now(),
			timesheets: [
				{
					workorder_id: 1,
					workorder: '81135678-1',
					Line: 1,
					Quantity: 169,
					helix1: "1/2 X 16'",
					helix2: "1/2 X 16'",
					helix3: "1/2 X 16'",
					helix4: "1/2 X 16'",
					other: 'CCMC',
					Cut: 75,
					Welder: 75,
					QC: 75,
				},
				{
					workorder_id: 2,
					workorder: '81135678-1',
					Line: 1,
					Quantity: 169,
					helix1: "1/2 X 16'",
					helix2: "1/2 X 16'",
					helix3: "1/2 X 16'",
					helix4: "1/2 X 16'",
					other: 'CCMC',
					Cut: 75,
					Welder: 75,
					QC: 75,
				},
			],
		},
		{
			user_id: 3,
			first_name: 'James',
			last_name: 'Bob',
			Job: 'Welder',
			position_name: 'Welder',
			station_name: 'Welding Station 1',
			task_name: 'Welding',
			start_time: Date.now(),
			end_time: Date.now(),
			timesheets: null,
		},
		{
			user_id: 3,
			first_name: 'James',
			last_name: 'Bob',
			Job: 'Welder',
			position_name: 'Welder',
			station_name: 'Welding Station 1',
			task_name: 'Welding',
			start_time: null,
			timesheets: null,
		},
	];
	res.json({ dog: data });
});

router.post('/search', function (req, res, next) {
	// req.body.q has your search term, right? depends on the input name on the html.
	res.redirect('/search?q=' + req.body.content);
});

router.get('/search', async (req, res) => {
	console.log(req.query.q);
	const content = req.query.q;
	const customerInfo = await knex('roterranet.customer')
		.where('name', 'like', `%${content}%`)
		.first();

	res.render('Find', { customerInfo });
});

router.get('/data', async (req, res) => {
	const work_order_id = '8113308-12';
	const customer = 'Distributor';
	const contact = 'Leili';
	const delivery_date = '2/28/2021';
	const line_num = 1;
	const user_id = 5;
	const pile_group_num = 14638;

	// const header_info = await knex.raw("select * from retrievepipeheaderinformation(" +  + ")")
	// .where('pile_id', pile_group_num)

	// const user_info = await knex("roterranet.users")
	// .where('user_id', user_id)

	const pile_group = await knex('roterranet.pile').where('id', pile_group_num);

	const all_piles = await knex('roterranet.pile_detail').where('pile_id', pile_group_num);

	res.json({ pile_group: pile_group, all_piles: all_piles });
});

// router.get('/pagination', async (req, res) => {
//     const page = req.body.page

//     const user_info = await knex("roterranet.users")
//     .where('deleted_by', null)
//     .orderBy('first_name', 'ASC')
//     .limit(10)
//     .offset(page * 10)

//     const user_total = await knex("roterranet.users")
//     .count()
//     const pages_total = Math.ceil(parseInt(user_total[0].count) / 10)
//     // const pages_total = Math.ceil(user_total / 10)

//     res.json({userData: user_info, num_pages: pages_total })

// });

router.post('/pagination', async (req, res) => {
	const { search, page } = req.body;

	let user_info;
	let user_total;

	if (search.length == 0) {
		// sql = "SELECT * FROM roterranet.users LEFT JOIN roterranet.positions ON users.position = positions.position_id LEFT JOIN roterranet.company = company.company_id ON users.company WHERE deleted_by IS NULL ORDER BY first_name ASC LIMIT 10 OFFSET" + page * 10
		user_info = await knex
			.select(
				'users.user_id',
				'users.first_name',
				'users.last_name',
				'users.work_email',
				'users.forklift',
				'users.skidsteer',
				'users.crane',
				'users.loader',
				'positions.position_name',
				'company.legal_name'
			)
			.from('roterranet.users')
			.leftJoin('roterranet.positions', 'users.position', 'positions.position_id')
			.leftJoin('roterranet.company', 'users.company', 'company.company_id')
			.where('deleted_by', null)
			.orderBy('first_name', 'ASC')
			.limit(10)
			.offset(page * 10);

		// sql = "SELECT count(*) FROM roterranet.users WHERE deleted_by IS NULL"
		user_total = await knex('roterranet.users').where('deleted_by', null).count();
	} else {
		// sql = "SELECT * FROM roterranet.users LEFT JOIN roterranet.positions ON users.position = positions.position_id LEFT JOIN roterranet.company = company.company_id WHERE deleted_by IS NULL AND (first_name ilike %" + search + "% or last_name ilike %" + search + "%) ORDER BY first_name ASC LIMIT 10 OFFSET" + page * 10
		user_info = await knex
			.select(
				'users.user_id',
				'users.first_name',
				'users.last_name',
				'users.work_email',
				'users.forklift',
				'users.skidsteer',
				'users.crane',
				'users.loader',
				'positions.position_name',
				'company.legal_name'
			)
			.from('roterranet.users')
			.leftJoin('roterranet.positions', 'users.position', 'positions.position_id')
			.leftJoin('roterranet.company', 'users.company', 'company.company_id')
			.where('deleted_by', null)
			.where((builder) => {
				builder
					.where('first_name', 'ilike', `%${search}%`)
					.orWhere('last_name', 'ilike', `%${search}%`);
			})
			.orderBy('first_name', 'ASC')
			.limit(10)
			.offset(page * 10);

		// sql = "SELECT count(*) FROM roterranet.users WHERE deleted_by IS NULL AND (first_name ilike %" + search + "% or last_name ilike %" + search + "%)
		user_total = await knex('roterranet.users')
			.where('deleted_by', null)
			.where((builder) => {
				builder
					.where('first_name', 'ilike', `%${search}%`)
					.orWhere('last_name', 'ilike', `%${search}%`);
			})
			.count();
	}
	const pages_total = Math.ceil(parseInt(user_total[0].count) / 10);

	res.json({ userData: user_info, num_pages: pages_total });
});

router.get('/excel', async (req, res) => {
	res.setHeader(
		'Content-Disposition',
		"attachment; filename='alltest1'; filename*=UTF-8''alltest1.xlsx"
	);
	res.setHeader(
		'Content-Type',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	);

	data = await knex.from('roterranet.users').limit(20);

	/* make the worksheet */
	var ws = XLSX.utils.json_to_sheet(data);

	/* add to workbook */
	var wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, 'All');

	XLSX.writeFile(wb, 'Report.xlsx'); //This saves the file in my server but I don't know how to send it as a response.

	// res.setHeader('Content-Type', 'application/vnd.openxmlformats');
	// res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");

	// var ext = (fields.bookType || "xlsx").toLowerCase();
	res.setHeader('Content-Disposition', 'attachment; filename="download.xlsx');
	res.end(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));

	// res.end(wb, 'binary');
	// })
	// .catch(function (error) {
	// })

	//     var conf ={};
	// conf.name = "mysheet";
	// conf.cols = [{
	// 	caption:'string',
	//     type:'string',
	//     beforeCellWrite:function(row, cellData){
	// 		 return cellData.toUpperCase();
	// 	},
	//     width:28.7109375
	// },{
	// 	caption:'date',
	// 	type:'date',
	// 	beforeCellWrite:function(){
	// 		var originDate = new Date(Date.UTC(1899,11,30));
	// 		return function(row, cellData, eOpt){
	//       		if (eOpt.rowNum%2){
	//         		eOpt.styleIndex = 1;
	//       		}
	//       		else{
	//         		eOpt.styleIndex = 2;
	//       		}
	//             if (cellData === null){
	//               eOpt.cellType = 'string';
	//               return 'N/A';
	//             } else
	//               return (cellData - originDate) / (24 * 60 * 60 * 1000);
	// 		}
	// 	}()
	// },{
	// 	caption:'bool',
	// 	type:'bool'
	// },{
	// 	caption:'number',
	// 	 type:'number'
	// }];
	// conf.rows = [
	// 	['pi', new Date(Date.UTC(2013, 4, 1)), true, 3.14],
	// 	["e", new Date(2012, 4, 1), false, 2.7182],
	//     ["M&M<>'", new Date(Date.UTC(2013, 6, 9)), false, 1.61803],
	//     ["null date", null, true, 1.414]
	// ];
	// // var result = nodeExcel.execute(conf);
	// res.setHeader('Content-Type', 'application/vnd.openxmlformats');
	// res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
	// res.end(wb, 'binary');
});

// router.post('/timesheet/project', async (req, res) => {

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

//     // const projectData = await knex.select("workorders.workorder_id","workorders.id as workorder_pk", "workorders.project_id as project_id")
//     // .from("roterranet.workorders")
//     // // .leftJoin("roterranet.project","workorders.project_id","project.id")
//     // .where("workorders.status", 2)
//     // // orderBy("workorders.id", "desc")

//     res.json({projectData: projectData})

// });

// router.post('/timesheet', async (req, res) => {
//     // sql = "SELECT user_id, first_name, last_name FROM roterranet.users WHERE company = 2 and deleted = 1
//     const user_info = await knex.select("user_id", "first_name", "last_name").from("roterranet.users").where("company", 2).andWhere("deleted", 0).orderBy("first_name")

//     res.json({userData: user_info})

// });

module.exports = router;
