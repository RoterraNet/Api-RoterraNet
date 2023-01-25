const express = require('express');
const router = express.Router({ mergeParams: true });
const knex = require('../01_Database/connection');

const deleteRoute = require('./RouteCreaters/delete');
const postRoute = require('./RouteCreaters/post');
const getRoute = require('./RouteCreaters/get');
const getTableRoute = require('./RouteCreaters/getTable');
const putRoute = require('./RouteCreaters/put');

const database = require('../01_Database/database');
const getEquipmentDB = database.getEquipmentDB;
const postEquipmentDB = database.postEquipmentDB;

const datefns = require('date-fns');
const today_now = datefns.format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

// /equpiment -> GET ALL
router.get('/', async (req, res) => {
	const getEntries = await knex(getEquipmentDB).select(knex.raw("concat(unit_number, ' ' , make_model) as unit_number_name"), knex.raw("concat(unit_number, ' ' , make_model) as unit_number_id")).orderBy('unit_number', 'asc');

	res.json(getEntries);
});

// /equipment -> PATCH -> TABLE -> get all equipments paginated
getTableRoute.getTableData(router, getEquipmentDB);

// /equipment -> POST -> create equipment
postRoute.newEntry(router, getEquipmentDB, postEquipmentDB, today_now, 'equipment_id');

// /equipment/:id -> GET -> get one equipment
getRoute.getById(router, getEquipmentDB, 'equipment_id');

// /equipment/:id -> PUT -> edit one equipment
putRoute.editById(router, getEquipmentDB, postEquipmentDB, today_now, 'equipment_id');

// /equipment/:id -> DELETE -> delete one equipment
deleteRoute.deleteRoute(router, postEquipmentDB, today_now, 'equipment_id');

module.exports = router;
