const express = require('express');
const router = express.Router();
const authorize = require('../Authorization/authorization');

const platesController = require('./platesController');

router.get('/thickness', authorize({}), platesController.getThickness);

module.exports = router;
