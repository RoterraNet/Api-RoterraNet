const express = require('express');
const authorize = require('../../Authorization/authorization');
const router = express.Router();
const userHierarchyController = require('./usersHierarchyController')

router.get('/activeEmployees', authorize({}), userHierarchyController.getAllActiveEmployees);
router.get('/chartData', authorize({}), userHierarchyController.getChartData);
router.post('/chartData', authorize({}), userHierarchyController.postChartData);

module.exports = router;