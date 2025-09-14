const express = require('express');
const { login, registerInvitedUser, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const router = express.Router();

// These routes are accessed via a subdomain, so they will have `req.tenant`
router.post('/login', login);
router.post('/register', registerInvitedUser);
router.get('/me', protect, getMe);
router.get('/logout', logout);

module.exports = router;