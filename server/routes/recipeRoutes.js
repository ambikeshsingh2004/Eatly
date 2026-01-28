const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validate, validationRules } = require('../middleware/validator');

// All recipe routes require authentication
router.use(authMiddleware);

// POST /api/recipes/get - Get detailed recipe for a specific dish
router.post(
  '/get',
  validationRules.recipeRequest,
  validate,
  recipeController.getRecipe
);

module.exports = router;
