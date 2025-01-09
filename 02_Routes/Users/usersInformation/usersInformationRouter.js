const express = require('express');
const authorize = require('../../Authorization/authorization');
const router = express.Router();

const usersInformationController = require('./usersInformationController');

router.put('/updateGeneralInformation', authorize({}), usersInformationController.updateGeneralInformation);
router.get('/getIntranetPermissions', authorize({}), usersInformationController.getIntranetPermissions);
router.put('/updateIntranetPermissions', authorize({}), usersInformationController.updateIntranetPermissions);
router.get('/getIntranetLimits', authorize({}), usersInformationController.getIntranetLimits);

module.exports = router;
