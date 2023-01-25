const express = require('express');
const router = express.Router();

const getTableRoute = require('./RouteCreaters/getTable');

const database = require('../01_Database/database');

const getContactDB = database.getContactDB;

getTableRoute.getTableData(router, getContactDB);

module.exports = router;
