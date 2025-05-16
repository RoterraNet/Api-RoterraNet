const express = require('express');
const router = express.Router();
const authorize = require('../Authorization/authorization');

const ExamsController = require('./ExamsController');
const ExamInfoContoller = require('./ExamInfoController');

router.get('/info', authorize({}), ExamInfoContoller.getExamInfo);
router.put('/info', authorize({}), ExamInfoContoller.updateExamInfo);

router.get('', authorize({}), ExamsController.getExams);
router.post('', authorize({}), ExamsController.createExam);
router.put('', authorize({}), ExamsController.updateExam);

module.exports = router;
