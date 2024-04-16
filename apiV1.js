const express = require('express');
const router = express.Router();

const v1UsersRouter = require('./02_Routes/Users/v1UsersRouter');

router.use('/users', v1UsersRouter);

module.exports = router;
