// const express = require('express');
// const router = express.Router();

// const { getUsersHierarchyDB } = require('../../../01_Database/database');

// const knex = require('../../../01_Database/connection');
// const authorize = require('../../Authorization/authorization');

// router.get('/get_hierarchy', authorize(), async (req, res) => {
// 	const data = await knex(getUsersHierarchyDB).select();

// 	function transformData(inputData) {
// 		const map = new Map();
// 		const rootNodes = [];

// 		// Build a map of all nodes
// 		inputData.forEach((item) => {
// 			const {
// 				manager_id,
// 				manager_name,
// 				subordinates,
// 				manager_position,
// 				manager_department_name,
// 				manager_image,
// 			} = item;
// 			const managerNode = map.get(manager_id) || {
// 				id: manager_id,
// 				name: manager_name,
// 				title: manager_position,
// 				department: manager_department_name,
// 				image: manager_image,
// 				children: [],
// 			};
// 			map.set(manager_id, managerNode);
// 			subordinates.forEach((subordinate) => {
// 				const {
// 					subordinate_id,
// 					subordinate_name,
// 					subordinate_position,
// 					subordinate_department_name,
// 					subordinate_image,
// 				} = subordinate;
// 				const subordinateNode = map.get(subordinate_id) || {
// 					id: subordinate_id,
// 					name: subordinate_name,
// 					title: subordinate_position,
// 					department: subordinate_department_name,
// 					image: subordinate_image,
// 					children: [],
// 				};
// 				map.set(subordinate_id, subordinateNode);
// 				managerNode.children.push(subordinateNode);
// 			});
// 			if (!manager_id && managerNode.children.length > 0) {
// 				rootNodes.push(managerNode);
// 			}
// 		});
// 		return rootNodes;
// 	}
// 	const transformedData = transformData(data);
// 	const resData = transformedData[0].children[0];
// 	res.send(resData);
// });

// module.exports = router;

const express = require('express');
const router = express.Router();

const { getUsersDB, getOrganizationalChartDB, postOrganizationalChartDB } = require('../../../01_Database/database');

const knex = require('../../../01_Database/connection');

const getAllActiveEmployees = async (req, res) => {
	try {
		const data = await knex(getUsersDB)
			.select(knex.raw("CONCAT(first_name,' ',last_name) as full_name"), 'position_name', 'user_id', 'image')
			.where('deleted', '=', 0)
			.orderBy('first_name', 'asc');
		
		data.forEach((user, index) => {
			data[index] = {
				nodeLabel: user.full_name,
				nodeData: {
					full_name: user.full_name,
					position_name: user.position_name,
					image: user.image,
					user_id: user.user_id
				}
			}
		})
		res.status(200).json(data);
	} catch (e) {
		res.status(500).json({ message: 'Error getting active employees', color: 'error', error: e })
		console.log(e)
	}
}

const getChartData = async (req, res) => {
	try {
		const data = await knex(getOrganizationalChartDB)
			.select(knex.raw("*"))
			.orderBy('id', 'desc')
			.limit("1");
		res.status(200).json({message: 'Successfully retrieved chart data', color: 'success', data: data})
	} catch (e) {
		res.status(500).json({ message: 'Error getting chart data', color: 'error', error: e })
		console.log(e)
	}
	
}

const postChartData = async (req, res) => {
	try {
		console.log(req.body)
		await knex(postOrganizationalChartDB).insert(req.body);
		res.status(200).json({message: 'Successfully saved uploaded chart data', color: 'success'});
	} catch (e) {
		res.status(500).json({ message: 'Error uploading chart data', color: 'error', error: e })
		console.log(e)
	}
}

module.exports = {
	getAllActiveEmployees,
	getChartData,
	postChartData
}
