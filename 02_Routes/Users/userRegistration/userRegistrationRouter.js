const express = require('express');
const authorize = require('../../Authorization/authorization');
const router = express.Router();

const userRegistrationController = require('./userRegistrationController');

router.post('/register', userRegistrationController.registerUser); // registration does not use cookie

module.exports = router;
