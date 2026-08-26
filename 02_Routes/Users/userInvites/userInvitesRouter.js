const express = require('express');
const authorize = require('../../Authorization/authorization');
const router = express.Router();

const userInvitesController = require('./userInvitesController');

router.post('/generateInvite', authorize({}), userInvitesController.generateInvite);
router.post('/validateInvite', userInvitesController.validateInvite); // invite validation does not use cookie

module.exports = router;
