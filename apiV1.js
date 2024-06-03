const express = require('express');
const router = express.Router();

const v1UsersRouter = require('./02_Routes/Users/v1UsersRouter');
const v1ProjectsRouter = require('./02_Routes/Projects/v1ProjectsRouter');

router.use('/users', v1UsersRouter);

router.use('/projects', v1ProjectsRouter);

module.exports = router;
