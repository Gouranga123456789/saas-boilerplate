const express = require('express');
const { inviteUser, getUsers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const router = express.Router();

// All routes here are protected and require the user to be an 'admin'
router.use(protect);
router.use(authorize('admin'));

router.post('/invite', inviteUser);
router.get('/', getUsers);

module.exports = router;