const express = require('express');
const router = express.Router();
const authorize = require('../Authorization/authorization');

const qualityFilesController = require('./qualityFilesController');

router.get('/qualityFiles', authorize({}), qualityFilesController.getQualityFiles);
router.post('/qualityFiles', authorize({}), qualityFilesController.addQualityFile);
router.put('/qualityFiles', authorize({}), qualityFilesController.deleteQualityFile);

module.exports = router;
