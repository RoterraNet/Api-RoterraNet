const express = require('express');
const router = express.Router();
const authorize = require('../Authorization/authorization');

const signableFormsController = require('./signableFormsController');

router.put('/signableForms', authorize({}), signableFormsController.deleteSignableForm);
router.post('/signableForms', authorize({}), signableFormsController.addSignableForm);
router.get('/signableForms', authorize({}), signableFormsController.getSignableForms);

router.get('/signableForms/formToSign', authorize({}), signableFormsController.getFormToSign);

module.exports = router;
