const express = require('express');
const router = express.Router();
const authorize = require('../Authorization/authorization');

const ncrController = require('./ncrController');

router.get('/ncroptions', authorize({}), ncrController.ncrOptions);

module.exports = router;
