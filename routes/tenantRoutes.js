const express = require('express');
const { createTenant } = require('../controllers/tenantController');
const router = express.Router();

// This route does not need the identifyTenant middleware
router.post('/', createTenant);

module.exports = router;