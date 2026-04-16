const express = require('express');
const router = express.Router();
const authorize = require('../Authorization/authorization');

const workorderHeatsController = require('./workorderHeatsController');
const workordersController = require('./workordersController');
const workorderQCController = require('./WorkorderQC/WorkorderQcController');
const WorkorderInspectionController = require('./WorkorderQC/WorkorderInspectionController');

router.get('', authorize({}), workordersController.getWorkorders);

router.get('/heats', authorize({}), workorderHeatsController.getWorkorderHeats);
router.get('/getQCAnswers', workorderQCController.getWorkordersQcAnswers);
router.get('/getQCQuestions', workorderQCController.getWorkordersQcQuestions);
router.post('/postQCAnswers', workorderQCController.postWorkordersQcAnswers);
router.get('/workorderInspectionTable', WorkorderInspectionController.WorkorderInspectionTable);
router.get(
	'/workorderInspectionGetPipeName',
	WorkorderInspectionController.WorkorderInspectionGetPipeName
);

module.exports = router;
