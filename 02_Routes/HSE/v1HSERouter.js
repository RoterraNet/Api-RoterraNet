const express = require('express');
const router = express.Router();
const authorize = require('../Authorization/authorization');

const HSEFilesController = require('./HSEFilesController');

router.get('/hseFiles', authorize({}), HSEFilesController.getHSEFiles);
router.post('/hseFiles', authorize({}), HSEFilesController.addHSEFile);
router.put('/hseFiles', authorize({}), HSEFilesController.deleteHSEFile);

module.exports = router;
