const express = require('express');
const router = express.Router({ mergeParams: true });
const knex = require('../01_Database/connection');

const deleteRoute = require('./RouteCreaters/delete');
const postRoute = require('./RouteCreaters/post');
const getRoute = require('./RouteCreaters/get');
const getTableRoute = require('./RouteCreaters/getTable');
const putRoute = require('./RouteCreaters/put');

const database = require('../01_Database/database');
const getWorkordersItemsDetailsWeldersDB = database.getWorkordersItemsDetailsWeldersDB;
const postWorkordersItemsDetailsWeldersDB = database.postWorkordersItemsDetailsWeldersDB;

const datefns = require('date-fns');
const today_now = datefns.format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

// /workorders/:id/workorder_items/:id/workorders_items_details/:id/welders -> POST -> create new workorder item detail welder
postRoute.newEntry(router, getWorkordersItemsDetailsWeldersDB, postWorkordersItemsDetailsWeldersDB, today_now, 'workorder_item_detail_welder_id');

// /workorders/:id/workorder_items/:id/workorders_items_details/:id/welders/:id -> DELETE -> delete workorder item detail welder
deleteRoute.deleteRoute(router, postWorkordersItemsDetailsWeldersDB, today_now, 'workorder_item_detail_welder_id');

// /workorders/:id/workorder_items/:id/workorders_items_details/:id/welders/:id -> DELETE -> delete workorder item detail welder
// /workorders/:id/workorder_items/:id/workorders_items_details/:id/welders/:id?type=delete_all -> DELETE -> delete workorder item detail welder with workorder item detail XXX
deleteRoute.deleteRoute(router, postWorkordersItemsDetailsWeldersDB, today_now, 'workorder_item_detail_welder_id', 'workorder_item_detail_id');

module.exports = router;
