const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { authLimiter } = require('../middlewares/rateLimitMiddleware');

router.post('/login', authLimiter, login);

module.exports = router;
