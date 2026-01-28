const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validate, validationRules } = require('../middleware/validator');

// All ingredient routes require authentication
router.use(authMiddleware);

// POST /api/ingredients/analyze - Analyze image for ingredients
router.post('/analyze', ingredientController.analyzeImage);

// POST /api/ingredients/suggest-recipes - Get recipe suggestions from ingredients
router.post(
  '/suggest-recipes',
  validationRules.ingredientsRequest,
  validate,
  ingredientController.suggestRecipes
);

module.exports = router;
