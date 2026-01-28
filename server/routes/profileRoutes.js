const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validate, validationRules } = require('../middleware/validator');

// All profile routes require authentication
router.use(authMiddleware);

// Onboarding
router.post(
  '/onboarding',
  validationRules.onboarding,
  validate,
  profileController.completeOnboarding
);

// Profile CRUD
router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);

// Nutrition targets
router.get('/macros', profileController.getMacros);

module.exports = router;
