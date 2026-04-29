const express = require('express');
const router = express.Router();
const authorize = require('../Authorization/authorization');

const EquipmentInspectionRouters = require('./EquipmentInspections/EquipmentInspectionsRouter');

router.use('/equipmentInspections', EquipmentInspectionRouters);

module.exports = router;
