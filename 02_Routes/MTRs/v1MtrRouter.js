const express = require('express');
const router = express.Router();
const MTRheatRouter = require('./MTRHeats/MTRHeatRouter');

router.use('/heatrouter', MTRheatRouter);

module.exports = router;
