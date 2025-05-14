const express = require('express');
const router = express.Router();
const authorize = require('../Authorization/authorization');

const usersDashboardRouter = require('./usersDashboard/usersDashboardRouter');
const usersBoardingRouter = require('./usersBoarding/usersBoardingRouter');
const usersInformationRouter = require('./usersInformation/usersInformationRouter');

const usersController = require('./usersController');

router.use('/dashboard', usersDashboardRouter);
router.use('/usersBoarding', usersBoardingRouter);
router.use('/usersInformation', usersInformationRouter);

router.get('', authorize({}), usersController.getUsers);

module.exports = router;
