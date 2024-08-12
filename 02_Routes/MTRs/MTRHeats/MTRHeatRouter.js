const express = require('express');
const authorize = require('../../Authorization/authorization');
const MTRHeatController = require('./MTRHeatController');
const router = express.Router();

/**
 * @openapi
 * /api/v1/mtr/heatrouter/addHeat:
 *   post:
 *     summary: Creates a new MTR and adds heats to that MTR
 *     tags:
 *       - MTR & Heats
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
 *             $ref: '#/components/schemas/mtrAddNew'
 *     responses:
 *       '200':
 *         description: A list of all new hires
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/mtrAddNew'
 *     securitySchemes:
 *       bearerAuth:
 *         type: http
 *         scheme: bearer
 *         bearerFormat: JWT
 *         description: |
 *           JWT token for authorization.
 *           You can obtain a token by logging in and using the /api/auth/login endpoint.
 */
router.post('/addHeat', authorize({}), MTRHeatController.AddNewHeats);

/**
 * @openapi
 * /api/v1/mtr/heatrouter/addHeatsToMTR:
 *   post:
 *     summary:  Adds heats to  MTR
 *     tags:
 *       - MTR & Heats
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
 *             $ref: '#/components/schemas/mtrAddNew'
 *     responses:
 *       '200':
 *         description: A list of all new hires
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/mtrAddNew'
 *     securitySchemes:
 *       bearerAuth:
 *         type: http
 *         scheme: bearer
 *         bearerFormat: JWT
 *         description: |
 *           JWT token for authorization.
 *           You can obtain a token by logging in and using the /api/auth/login endpoint.
 */
router.post('/addHeatsToMTR', authorize({}), MTRHeatController.AddNewHeatsToMTR);

module.exports = router;
