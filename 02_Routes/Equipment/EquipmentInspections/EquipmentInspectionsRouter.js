const express = require('express');
const authorize = require('../../Authorization/authorization');
const router = express.Router();

const {
	getEquipmentInspectionSchemas,
	getEquipmentInspectionTable,
	getShopEquipment,
	postEquipmentInspection,
} = require('./EquipmentInspectionsController');

router.get('/getEquipmentInspectionTable', getEquipmentInspectionTable);
router.get('/getEquipmentInspectionSchemas', getEquipmentInspectionSchemas);
router.get('/getShopEquipment', getShopEquipment);

router.post('/postEquipmentInspection', postEquipmentInspection);

module.exports = router;
