const express = require('express');
const router = express.Router();
const usersDashboardRouter = require('./usersDashboard/usersDashboardRouter');
const usersBoardingRouter = require('./usersBoarding/usersBoardingRouter');
const usersInformationRouter = require('./usersInformation/usersInformationRouter');

router.use('/dashboard', usersDashboardRouter);
router.use('/usersBoarding', usersBoardingRouter);
router.use('/usersInformation', usersInformationRouter);

module.exports = router;
