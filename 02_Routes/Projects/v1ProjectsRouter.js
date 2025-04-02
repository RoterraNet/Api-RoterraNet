const express = require('express');
const router = express.Router();
const ProjectSurveyRouter = require('./Survey/ProjectSurveyRouter');
const projectsEmailListController = require('../Projects/Project_email_list/projectsEmailListController');
const authorize = require('../Authorization/authorization');

router.use('/survey', ProjectSurveyRouter);

router.get('/projectsEmailList', authorize({}), projectsEmailListController.getProjectsEmailList);
router.post('/projectsEmailList', authorize({}), projectsEmailListController.addProjectsEmailList);
router.put(
	'/projectsEmailList',
	authorize({}),
	projectsEmailListController.deleteProjectsEmailList
);

module.exports = router;
