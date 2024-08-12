const express = require('express');
const router = express.Router();

const v1UsersRouter = require('./02_Routes/Users/v1UsersRouter');
const v1ProjectsRouter = require('./02_Routes/Projects/v1ProjectsRouter');
const v1MtrRouter = require('./02_Routes/MTRs/v1MtrRouter');

const v1CalendarRouter = require('./02_Routes/calendar/v1CalendarRouter');

router.use('/calendar', v1CalendarRouter);

router.use('/users', v1UsersRouter);

router.use('/projects', v1ProjectsRouter);

router.use('/mtr', v1MtrRouter);

module.exports = router;
