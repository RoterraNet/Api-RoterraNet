const express = require('express');
const authorize = require('../../Authorization/authorization');
const router = express.Router();
const userHierarchyController = require('./usersHierarchyController')

router.get('/getActiveEmployees', authorize({}), userHierarchyController.getAllActiveEmployees);

module.exports = router;