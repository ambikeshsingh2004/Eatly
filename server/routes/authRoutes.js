const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validate, validationRules } = require('../middleware/validator');

// Public routes
router.post('/signup', validationRules.signup, validate, authController.signup);
router.post('/login', validationRules.login, validate, authController.login);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.post('/logout', authMiddleware, authController.logout);
router.get('/user', authMiddleware, authController.getUser);

module.exports = router;
