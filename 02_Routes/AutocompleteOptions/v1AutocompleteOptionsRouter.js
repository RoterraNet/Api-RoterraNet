const express = require('express');
const router = express.Router();
const authorize = require('../Authorization/authorization');

const plasmaRunSheetsOptionsController = require('./plasmaRunSheetsOptionsController');

router.get('/sheetAdd', authorize({}), plasmaRunSheetsOptionsController.getSheetAddOptions);
router.get(
	'/sheetInformation',
	authorize({}),
	plasmaRunSheetsOptionsController.getSheetInformationOptions
);
router.get('/sheetItems', authorize({}), plasmaRunSheetsOptionsController.getSheetItemsOptions);

module.exports = router;
