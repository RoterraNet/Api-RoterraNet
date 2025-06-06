const express = require('express');
const router = express.Router();
const authorize = require('../Authorization/authorization');

const ExamsController = require('./ExamsController');
const ExamInfoContoller = require('./ExamInfoController');
const AssignedExamsController = require('./AssignedExamsController');
const ExamHistoryController = require('./ExamHistoryController');

router.get('/info', authorize({}), ExamInfoContoller.getExamInfo);
router.put('/info', authorize({}), ExamInfoContoller.updateExamInfo);

router.get('', authorize({}), ExamsController.getExams);
router.post('', authorize({}), ExamsController.createExam);
router.put('', authorize({}), ExamsController.updateExam);

router.get('/assigned', authorize({}), AssignedExamsController.getExamsAssignedToUser);
router.put('/assigned', authorize({}), AssignedExamsController.unassignExam);
router.post('/assigned', authorize({}), AssignedExamsController.assignExams);
router.get('/assigned/users', authorize({}), AssignedExamsController.getUsersAssignedToExam);
router.get('/assigned/taking', authorize({}), AssignedExamsController.getExamUserIsTaking);
router.put('/assigned/taking', authorize({}), AssignedExamsController.gradeExamUserIsTaking);

router.get('/history', authorize({}), ExamHistoryController.getExamHistory);

module.exports = router;
