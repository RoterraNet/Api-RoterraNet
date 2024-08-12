const express = require('express');
const router = express.Router();
const CalendarEventsRouter = require('./calendarEvents/CalendarEventsRouter');

router.use('/CalendarEventsRouter', CalendarEventsRouter);

module.exports = router;
