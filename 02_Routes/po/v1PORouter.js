const express = require('express');
const router = express.Router();
const authorize = require('../Authorization/authorization');
const poEmailListController = require('./poEmailListController');
const poReceivedItemsController = require('./poReceivedItemsController');

router.get('/poEmailList', authorize({}), poEmailListController.getPoEmailList);
router.post('/poEmailList', authorize({}), poEmailListController.addPoEmailList);
router.put('/poEmailList', authorize({}), poEmailListController.deletePoEmailList);

router.put('/receivedItems', authorize({}), poReceivedItemsController.updatePoReceivedItems);
module.exports = router;
