const express = require('express');
const router = express.Router();
const authorize = require('../Authorization/authorization');

const workorderHeatsController = require('./workorderHeatsController');

router.get('/heats', authorize({}), workorderHeatsController.getWorkorderHeats);

module.exports = router;
