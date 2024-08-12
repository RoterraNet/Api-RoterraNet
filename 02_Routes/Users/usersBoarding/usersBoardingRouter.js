const express = require('express');
const authorize = require('../../Authorization/authorization');
const router = express.Router();
const usersBoardingController = require('./usersBoardingController');

/**
 * @openapi
 * /api/v1/users/usersBoarding/onBoardingQuestions:
 *   get:
 *     summary: Retrieve all new hires
 *     tags:
 *       - Users New Hires
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: JWT token for authorization
 *         required: true
 *     responses:
 *       '200':
 *         description: A list of all new hires
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NewHire'
 *     securitySchemes:
 *       bearer:
 *         type: http
 *         scheme: bearer
 *         bearerFormat: JWT
 */
router.get('/onBoardingQuestions', authorize({}), usersBoardingController.getOnboardingQuestions);

/**
 * @openapi
 * /api/v1/users/usersBoarding/onBoardingAnswers:
 *   get:
 *     summary: Retrieve all new hires
 *     tags:
 *       - Users New Hires
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: JWT token for authorization
 *         required: true
 *     responses:
 *       '200':
 *         description: A list of all new hires
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NewHire'
 *     securitySchemes:
 *       bearer:
 *         type: http
 *         scheme: bearer
 *         bearerFormat: JWT
 */
router.get('/onBoardingAnswers', authorize({}), usersBoardingController.updateOnBoardingAnswers);

module.exports = router;
