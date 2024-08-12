const express = require('express');
const router = express.Router();
const usersDashboardRouter = require('./usersDashboard/usersDashboardRouter');
const usersBoardingRouter = require('./usersBoarding/usersBoardingRouter');

router.use('/dashboard', usersDashboardRouter);
router.use('/usersBoarding', usersBoardingRouter);

module.exports = router;
