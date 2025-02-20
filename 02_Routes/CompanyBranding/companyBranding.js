const express = require('express');
const router = express.Router();
const CompanyBrandingRouter = require('./CompanyBrandingRouter/CompanyBrandingRouter');

router.use('/CompanyBranding', CompanyBrandingRouter);

module.exports = router;
