const express = require('express');
const router = express.Router();
const authorize = require('../Authorization/authorization');
const knex = require('../../01_Database/connection');

const plasmaRunSheetInformationController = require('./plasmaRunSheetInformationController');
const plasmaRunSheetItemsController = require('./plasmaRunSheetItemsController');
const plasmaRunSheetHelixSizesController = require('./plasmaRunSheetHelixSizesController');

router.get('', authorize({}), plasmaRunSheetInformationController.getSheetInformation);
router.get(`/table`, authorize({}), plasmaRunSheetInformationController.getTable);
router.put('', authorize({}), plasmaRunSheetInformationController.updateSheetInformation);
router.post('', authorize({}), plasmaRunSheetInformationController.createSheet);
router.post('/clone', authorize({}), plasmaRunSheetInformationController.cloneSheet);

router.get('/items', authorize({}), plasmaRunSheetItemsController.getSheetItems);
router.put('/items', authorize({}), plasmaRunSheetItemsController.updateSheetItems);

router.get('/helixSizes', authorize({}), plasmaRunSheetHelixSizesController.getHelixSizes);

module.exports = router;
