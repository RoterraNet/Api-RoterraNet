const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');
const { attachPaginate } = require('knex-paginate');
attachPaginate();

const deleteRoute = require('./RouteCreaters/delete');
const postRoute = require('./RouteCreaters/post');
const getRoute = require('./RouteCreaters/get');

const database = require('../01_Database/database');
const postWorkordersItemsDetailsInspectionsDB = database.postWorkordersItemsDetailsInspectionsDB;
const getWorkordersItemsDetailsInspectionsDB = database.getWorkordersItemsDetailsInspectionsDB;

const datefns = require('date-fns');
const today_now = datefns.format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

// /workorders/:id/workorder_items/:id/workorders_items_details/:id/inspections -> POST -> create new contact
postRoute.newEntry(
	router,
	getWorkordersItemsDetailsInspectionsDB,
	postWorkordersItemsDetailsInspectionsDB,
	today_now,
	'workorder_item_detail_inspection_id'
);

// /workorders/:id/workorder_items/:id/workorders_items_details/:id/inspections/:id -> GET -> get one contact
getRoute.getById(
	router,
	getWorkordersItemsDetailsInspectionsDB,
	'workorder_item_detail_inspection_id'
);

// /workorders/:id/workorder_items/:id/workorders_items_details/:id/inspections/:id -> DELETE -> delete one contact
deleteRoute.deleteRoute_RowRemove(
	router,
	postWorkordersItemsDetailsInspectionsDB,
	today_now,
	'workorder_item_detail_inspection_id'
);

module.exports = router;
