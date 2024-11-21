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
router.post('/onBoardingAnswers', authorize({}), usersBoardingController.updateOnBoardingAnswers);
/**
 * @openapi
 * /api/v1/users/usersBoarding/terminationReason:
 *   post:
 *     summary: Termination reason
 *     tags:
 *       - Users Termination reason
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: JWT token for authorization
 *         required: true
 *     responses:
 *       '200':
 *         description: Termination reason
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Termination reason'
 *     securitySchemes:
 *       bearer:
 *         type: http
 *         scheme: bearer
 *         bearerFormat: JWT
 */
router.post('/terminationReason', authorize({}), usersBoardingController.addTerminationReason);

/**
 * @openapi
 * /api/v1/users/usersBoarding/terminationReason:
 *   get:
 *     summary: Termination reason
 *     tags:
 *       - Users Termination reason
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: JWT token for authorization
 *         required: true
 *     responses:
 *       '200':
 *         description: Termination reason
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Termination reason'
 *     securitySchemes:
 *       bearer:
 *         type: http
 *         scheme: bearer
 *         bearerFormat: JWT
 */

router.get('/terminationReason', authorize({}), usersBoardingController.getTerminationReason);

module.exports = router;
