const express = require('express');
const authorize = require('../../Authorization/authorization');
const router = express.Router();

const usersInformationController = require('./usersInformationController');

router.put('/updateGeneralInformation', authorize({}), usersInformationController.updateGeneralInformation);

module.exports = router;
