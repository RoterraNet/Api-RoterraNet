const express = require('express');
const authorize = require('../../Authorization/authorization');
const router = express.Router();

const usersInformationController = require('./usersInformationController');

router.put('/generalInformation', authorize({}), usersInformationController.updateGeneralInformation);
router.get('/intranetPermissions', authorize({}), usersInformationController.getIntranetPermissions);
router.put('/intranetPermissions', authorize({}), usersInformationController.updateIntranetPermissions);
router.get('/intranetPermissionsLogs', authorize({}), usersInformationController.getIntranetPermissionsLogs);
router.get('/accountInformation', authorize({}), usersInformationController.getAccountInformation);
router.put('/accountInformation', authorize({}), usersInformationController.updateAccountInformation);

module.exports = router;
