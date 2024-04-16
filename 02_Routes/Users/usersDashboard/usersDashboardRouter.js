const express = require('express');
const authorize = require('../../Authorization/authorization');
const router = express.Router();
const userDashboardController = require('./newHiresController');
const offBoardingController = require('./offBoardingController');
const HrTodoController = require('./HrTodoController');

/**
 * @openapi
 * /api/v1/users/dashboard/newHires:
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
router.get('/newHires', authorize({}), userDashboardController.getAllNewHires);

/**
 * @openapi
 * /api/v1/users/dashboard/newHires:
 *   put:
 *     summary: Update a new hire
 *     tags:
 *       - Users New Hires
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: JWT token for authorization
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNewHire'
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
 *       bearerAuth:
 *         type: http
 *         scheme: bearer
 *         bearerFormat: JWT
 *         description: |
 *           JWT token for authorization.
 *           You can obtain a token by logging in and using the /api/auth/login endpoint.
 */
router.put('/newHires', authorize({}), userDashboardController.updateOneNewHireCheck);

/**
 * @openapi
 * /api/v1/users/dashboard/offboarding:
 *   get:
 *     summary: Retrieve all users that require off boarding
 *     tags:
 *       - Users Off Boarding
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
 *                 $ref: '#/components/schemas/UserOffBoarding'
 *     securitySchemes:
 *       bearer:
 *         type: http
 *         scheme: bearer
 *         bearerFormat: JWT
 */
router.get('/offBoarding', authorize({}), offBoardingController.getAllOffBoarding);

/**
 * @openapi
 * /api/v1/users/dashboard/offboarding:
 *   put:
 *     summary: Update a User that require off boarding
 *     tags:
 *       - Users Off Boarding
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: JWT token for authorization
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserOffBoarding'
 *     responses:
 *       '200':
 *         description: A list of all new hires
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserOffBoarding'
 *     securitySchemes:
 *       bearerAuth:
 *         type: http
 *         scheme: bearer
 *         bearerFormat: JWT
 *         description: |
 *           JWT token for authorization.
 *           You can obtain a token by logging in and using the /api/auth/login endpoint.
 */
router.put('/offBoarding', authorize({}), offBoardingController.updateOneOffBoardingCheck);

/**
 * @openapi
 * /api/v1/users/dashboard/offboarding:
 *   post:
 *     summary: Update a User that require off boarding
 *     tags:
 *       - Users Off Boarding
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: JWT token for authorization
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserOffBoarding'
 *     responses:
 *       '200':
 *         description: A list of all new hires
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserOffBoarding'
 *     securitySchemes:
 *       bearerAuth:
 *         type: http
 *         scheme: bearer
 *         bearerFormat: JWT
 *         description: |
 *           JWT token for authorization.
 *           You can obtain a token by logging in and using the /api/auth/login endpoint.
 */
router.post('/offBoarding', authorize({}), offBoardingController.createOffBoardingCheck);

/**
 * @openapi
 * /api/v1/users/dashboard/todo:
 *   get:
 *     summary: Gets a Summery of what is needed to be done
 *     tags:
 *       - Users todo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: JWT token for authorization
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserOffBoarding'
 *     responses:
 *       '200':
 *         description: A list of all new hires
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserOffBoarding'
 *     securitySchemes:
 *       bearerAuth:
 *         type: http
 *         scheme: bearer
 *         bearerFormat: JWT
 *         description: |
 *           JWT token for authorization.
 *           You can obtain a token by logging in and using the /api/auth/login endpoint.
 */
router.get('/todos', HrTodoController.getAllHrTodo);
module.exports = router;
