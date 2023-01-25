const express = require('express');
const router = express.Router();
const database = require('../01_Database/database');

const getTableRoute = require('./RouteCreaters/getTable');

const getPoAdvancedSearchDB = database.getPoAdvancedSearchDB;

// po -> PATCH -> TABLE -> get all quotes paginated
getTableRoute.getTableData(router, getPoAdvancedSearchDB);

module.exports = router;
