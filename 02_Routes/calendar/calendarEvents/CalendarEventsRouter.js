const express = require('express');
const authorize = require('../../Authorization/authorization');
const CalendarEventsController = require('./CalendarEventsController');
const router = express.Router();

/**
 * @openapi
 * /api/v1/calendar/CalendarEventsRouter/getLocations/:
 *   get:
 *     summary: Gets a list of all locations for calendar
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
 *         description: A list of all Calendar Locations
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
router.get('/getLocations', authorize({}), CalendarEventsController.getLocations);

/**
 * @openapi
 * /api/v1/calendar/CalendarEventsRouter/getCategories/:
 *   get:
 *     summary: Gets a list of all Categories for calendar
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
 *         description: A list of all Categories Locations
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
router.get('/getCategories', authorize({}), CalendarEventsController.getCategories);

/**
 * @openapi
 * /api/v1/calendar/CalendarEventsRouter/getSubCategories/:
 *   get:
 *     summary: Gets a list of all Sub - Categories for calendar
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
 *         description: A list of all SubCategories Locations
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
router.get('/getSubCategories', authorize({}), CalendarEventsController.getSubCategories);

/**
 * @openapi
 * /api/v1/calendar/CalendarEventsRouter/addCalendarEvent/:
 *   Post:
 *     summary: adds 1 event to the calendar
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
 *         description: Adds a calendar event
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
router.post('/addCalendarEvent', authorize({}), CalendarEventsController.addCalendarEvent);

module.exports = router;
