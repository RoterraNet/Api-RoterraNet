const express = require('express');
const router = express.Router();
const authorize = require('../Authorization/authorization');

const workorderHeatsController = require('./workorderHeatsController');
const workordersController = require('./workordersController');

router.get('', authorize({}), workordersController.getWorkorders);

router.get('/heats', authorize({}), workorderHeatsController.getWorkorderHeats);

module.exports = router;
