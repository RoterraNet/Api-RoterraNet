const express = require('express');
const router = express.Router();
const authorize = require('../Authorization/authorization');
const poEmailListController = require('./poEmailListController');
const poReceivedItemsController = require('./poReceivedItemsController');
const poFilesController = require('./poFilesController');

router.get('/poEmailList', authorize({}), poEmailListController.getPoEmailList);
router.post('/poEmailList', authorize({}), poEmailListController.addPoEmailList);
router.put('/poEmailList', authorize({}), poEmailListController.deletePoEmailList);

router.put('/receivedItems', authorize({}), poReceivedItemsController.updatePoReceivedItems);

router.get('/poFiles', authorize({}), poFilesController.getPoFiles);
router.post('/poFiles', authorize({}), poFilesController.addPoFile);
router.put('/poFiles', authorize({}), poFilesController.deletePoFile);

module.exports = router;
