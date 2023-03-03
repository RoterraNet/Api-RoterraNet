const express = require('express');
const router = express.Router();
const database = require('../../01_Database/database');
const knex = require('../../01_Database/connection');
const authorize = require('../Authorization/authorization');

const getEquipmentDB = database.getEquipmentDB;

const getEquipmentSchedulesDB = database.getEquipmentScheduleDB;
const postEquipmentSchedulesDB = database.postEquipmentSchedulesDB;
const getProjectsDB = database.getProjectsDB;

router.get('/allEquipment', authorize(), async (req, res) => {
	const allEquipment = await knex(getEquipmentDB)
		.select('equipment_id as id', 'unit_number as title')
		.where({ deleted: 0 })
		.whereIn('asset_type', ['Excavator', 'Skidsteer'])
		.orderBy('unit_number', 'asc');

	res.json(allEquipment);
});

router.get('/allOptions', authorize(), async (req, res) => {
	const allEquipment = await knex(getEquipmentDB)
		.select('equipment_id as value', 'unit_number as label')
		.where({ deleted: 0 })
		.whereIn('asset_type', ['Excavator', 'Skidsteer'])
		.orderBy('unit_number', 'asc');

	const allOptions = await knex(getProjectsDB)
		.select('id as value', 'workorder_id as label')
		.orderBy('workorder_id', 'desc')
		.whereNotNull('workorder_id')
		.limit(500);
	res.json({ allOptions, allEquipment });
});

router.get('/equipmentSchedule', authorize({ logistics_read: true }), async (req, res) => {
	const raw = knex.raw(
		`CONCAT(customer_name,' - ', project, ' - ', project_name) as title, trunc(EXTRACT(epoch FROM start_time) * 1000::numeric) AS start_time, trunc(EXTRACT(epoch FROM end_time) * 1000::numeric) AS end_time`
	);

	try {
		const allEquipmentSchedule = await knex(getEquipmentSchedulesDB)
			.select(
				'id',
				'equipment_id as group',
				'project_name as title',
				'start_time as start_date',
				'end_time as end_date',
				'color',
				'bgcolor',
				'selectedbgcolor',
				raw
			)
			.where({ deleted: false });
		res.status(200).json(allEquipmentSchedule);
	} catch (e) {
		console.log(e);
		res.status(500).json({
			message: 'Something Went Wrong',
			error: e,
		});
	}
});
router.get(
	'/equipmentScheduleDetail/:id',
	authorize({ logistics_read: true }),
	async (req, res) => {
		const { id } = req.params;
		try {
			const equipmentScheduleDetail = await knex(getEquipmentSchedulesDB)
				.select(
					'id',
					'equipment_id',
					'unit_number',
					'equipment_deleted',
					'project_name',
					'start_time',
					'end_time',
					'created_on',
					'created_by_name',
					'updated_on',
					'updated_by_name',
					'customer_name',
					'project',
					'projectmanager_name',
					'contact_name',
					'contact_phone'
				)
				.where({ id: id });
			res.status(200).json(equipmentScheduleDetail[0]);
		} catch (e) {
			console.log(e);
			res.status(500).json({
				message: 'Something Went Wrong',
				error: e,
			});
		}
	}
);

router.put('/equipmentSchedule', authorize({ logistics_update: true }), async (req, res) => {
	const values = req.body;

	try {
		const allEquipmentSchedule = await knex(postEquipmentSchedulesDB)
			.update({ ...values.update })
			.where({ id: values.id });
		res.status(202).json({ message: 'The Schedule was updated', color: 'success' });
	} catch (e) {
		console.log(e);
		res.status(500).json({
			message: 'Something Went Wrong',
			error: e,
		});
	}
});

router.post('/equipmentSchedule', authorize({ logistics_create: true }), async (req, res) => {
	const values = req.body;

	try {
		const allEquipmentSchedule = await knex(postEquipmentSchedulesDB).insert({ ...values });
		res.status(200).json({ message: 'The Schedule was updated', color: 'success' });
	} catch (e) {
		console.log(e);
		res.status(500).json({
			message: 'Something Went Wrong',
			error: e,
		});
	}
});

module.exports = router;
