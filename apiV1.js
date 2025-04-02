const express = require('express');
const router = express.Router();

const v1UsersRouter = require('./02_Routes/Users/v1UsersRouter');
const v1ProjectsRouter = require('./02_Routes/Projects/v1ProjectsRouter');
const v1MtrRouter = require('./02_Routes/MTRs/v1MtrRouter');
const v1HSERouter = require('./02_Routes/HSE/v1HSERouter');
const v1QualityRouter = require('./02_Routes/Quality/v1QualityRouter');
const v1CalendarRouter = require('./02_Routes/calendar/v1CalendarRouter');
const companyBranding = require('./02_Routes/CompanyBranding/companyBranding');
const v1PlasmaRunSheetsRouter = require('./02_Routes/PlasmaRunSheets/v1PlasmaRunSheetsRouter');
const v1PORouter = require('./02_Routes/po/v1PORouter');
const v1WorkordersRouter = require('./02_Routes/Workorders/v1WorkordersRouter');

router.use('/branding', companyBranding);

router.use('/calendar', v1CalendarRouter);

router.use('/users', v1UsersRouter);

router.use('/projects', v1ProjectsRouter);
router.use('/po', v1PORouter);

router.use('/mtr', v1MtrRouter);

router.use('/hse', v1HSERouter);

router.use('/quality', v1QualityRouter);

router.use('/plasmaRunSheets', v1PlasmaRunSheetsRouter);

router.use('/plates', v1PlatesRouter);

router.use('/workorders', v1WorkordersRouter);

module.exports = router;
