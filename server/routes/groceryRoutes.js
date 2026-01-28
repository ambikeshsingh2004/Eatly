const express = require('express');
const router = express.Router();
const groceryController = require('../controllers/groceryController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All grocery routes require authentication
router.use(authMiddleware);

// GET /api/grocery/meal-plan - Get personalized meal plan with grocery list
// Query params: days (default 3)
router.get('/meal-plan', groceryController.getMealPlan);

module.exports = router;
