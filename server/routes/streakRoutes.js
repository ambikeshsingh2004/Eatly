const express = require('express');
const router = express.Router();
const streakController = require('../controllers/streakController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validate, validationRules } = require('../middleware/validator');

// All streak routes require authentication
router.use(authMiddleware);

// POST /api/streaks/calorie-log - Log daily calorie intake
router.post(
  '/calorie-log',
  validationRules.calorieLog,
  validate,
  streakController.logCalories
);

// POST /api/streaks/exercise-log - Log daily exercise
router.post(
  '/exercise-log',
  validationRules.exerciseLog,
  validate,
  streakController.logExercise
);

// GET /api/streaks - Get current streak status
router.get('/', streakController.getStreaks);

// GET /api/streaks/history - Get log history
// Query params: days (default 7), type (all/calories/exercise)
router.get('/history', streakController.getHistory);

module.exports = router;
