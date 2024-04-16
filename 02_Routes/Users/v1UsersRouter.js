const express = require('express');
const router = express.Router();
const usersDashboardRouter = require('./usersDashboard/usersDashboardRouter');

router.use('/dashboard', usersDashboardRouter);

module.exports = router;
