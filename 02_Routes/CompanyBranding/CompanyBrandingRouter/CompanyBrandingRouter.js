const express = require('express');
const authorize = require('../../Authorization/authorization');
const CompanyBrandingController = require('./CompanyBrandingController');
const router = express.Router();

/**
 * @openapi
 * /api/v1/brand/companyBranding/getBrand/:
 *   get:
 *     summary: Gets the current Brand of app
 *     tags:
 *       - Calendar
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
 *         description: Gets the current Brand of Company
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
router.get('/getBrand', CompanyBrandingController.getBrand);
module.exports = router;
