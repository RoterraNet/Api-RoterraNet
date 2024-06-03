const express = require('express');
const router = express.Router();
const ProjectSurveyRouter = require('./Survey/ProjectSurveyRouter');

router.use('/survey', ProjectSurveyRouter);

module.exports = router;
