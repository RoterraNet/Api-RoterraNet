const express = require('express');
const authorize = require('../../Authorization/authorization');
const router = express.Router();

const usersInformationController = require('./usersInformationController');

router.put('/updateUserInformation', authorize({}), usersInformationController.updateGeneralInformation);
router.get('/getIntranetPermissions/:id', authorize({}), usersInformationController.getIntranetPermissions);
router.get('/getIntranetLimits/:id', authorize({}), usersInformationController.getIntranetLimits);

module.exports = router;
