const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router; 