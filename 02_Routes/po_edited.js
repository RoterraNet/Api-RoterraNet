const express = require('express');
const router = express.Router();
const database = require('../01_Database/database');

const getRoute = require('./RouteCreaters/get');

const getPoEditedDB = database.getPoEditedDB;

// po_edited/:po_id -> GET -> get one quote
getRoute.getById(router, getPoEditedDB, 'po_id');

module.exports = router;
