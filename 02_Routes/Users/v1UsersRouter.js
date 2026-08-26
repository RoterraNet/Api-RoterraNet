const express = require('express');
const router = express.Router();
const authorize = require('../Authorization/authorization');

const usersDashboardRouter = require('./usersDashboard/usersDashboardRouter');
const usersBoardingRouter = require('./usersBoarding/usersBoardingRouter');
const usersInformationRouter = require('./usersInformation/usersInformationRouter');
const userInvitesRouter = require('./userInvites/userInvitesRouter');
const userRegistrationRouter = require('./userRegistration/userRegistrationRouter');

const usersController = require('./usersController');

router.use('/dashboard', usersDashboardRouter);
router.use('/usersBoarding', usersBoardingRouter);
router.use('/usersInformation', usersInformationRouter);
router.use('/userInvites', userInvitesRouter);
router.use('/userRegistration', userRegistrationRouter);

router.get('', authorize({}), usersController.getUsers);
router.put('', authorize({}), usersController.updateUser);
module.exports = router;
