const express = require('express');
const router = express.Router();
const authorize = require('../Authorization/authorization');

const quotesFilesController = require('./quotesFilesController');

router.get('/quotesFiles', authorize({}), quotesFilesController.getQuotesFiles);
router.post('/quotesFiles', authorize({}), quotesFilesController.addQuotesFile);
router.put('/quotesFiles', authorize({}), quotesFilesController.deleteQuotesFile);

module.exports = router;
