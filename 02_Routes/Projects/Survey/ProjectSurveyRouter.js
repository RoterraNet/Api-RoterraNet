const express = require('express');
// const authorize = require('../../Authorization/authorization');
const router = express.Router();

const ProjectSurveyController = require('./ProjectSurveyController');
const authorize = require('../../Authorization/authorization');

/**
 * @openapi
 * /api/v1/projects/survey/table:
 *   get:
 *     summary: Retrieve all new Survey for that project
 *     tags:
 *       - Survey
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: JWT token for authorization
 *         required: true
 *     responses:
 *       '200':
 *         description: A list of all survey for that project
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *     securitySchemes:
 *       bearer:
 *         type: http
 *         scheme: bearer
 *         bearerFormat: JWT
 */
router.get('/table', authorize({}), ProjectSurveyController.getProjectSurveyTable);

/**
 * @openapi
 * /api/v1/projects/survey/sendSurvey:
 *   post:
 *     summary: Sends out a survey to the selected contact
 *     tags:
 *       - Survey
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: JWT token for authorization
 *         required: true
 *     responses:
 *       '200':
 *         description: Sends out a survey to the selected contact
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *     securitySchemes:
 *       bearer:
 *         type: http
 *         scheme: bearer
 *         bearerFormat: JWT
 */
router.post('/sendSurvey', authorize({}), ProjectSurveyController.sendOneSurvey);
module.exports = router;
