const { body, validationResult } = require('express-validator');

/**
 * Validation result handler
 * Checks for validation errors and returns proper response
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Validation rules for different endpoints
 */
const validationRules = {
  // Auth validations
  signup: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('fullName')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Name must be at least 2 characters')
  ],

  login: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  // Profile/Onboarding validations
  onboarding: [
    body('age')
      .isInt({ min: 13, max: 120 })
      .withMessage('Age must be between 13 and 120'),
    body('gender')
      .isIn(['male', 'female', 'other'])
      .withMessage('Gender must be male, female, or other'),
    body('weight')
      .isFloat({ min: 20, max: 500 })
      .withMessage('Weight must be between 20 and 500 kg'),
    body('height')
      .isFloat({ min: 50, max: 300 })
      .withMessage('Height must be between 50 and 300 cm'),
    body('dietType')
      .isIn(['vegetarian', 'non-vegetarian', 'vegan', 'eggetarian'])
      .withMessage('Invalid diet type'),
    body('goal')
      .isIn(['muscle_gain', 'weight_loss', 'weight_gain', 'maintain', 'athletic'])
      .withMessage('Invalid goal'),
    body('activityLevel')
      .isIn(['sedentary', 'light', 'moderate', 'active', 'very_active'])
      .withMessage('Invalid activity level')
  ],

  // Exercise preferences validation
  exercisePreferences: [
    body('canGoGym').isBoolean().withMessage('canGoGym must be true or false'),
    body('homeWorkout').isBoolean().withMessage('homeWorkout must be true or false'),
    body('canCycle').isBoolean().withMessage('canCycle must be true or false'),
    body('canSwim').isBoolean().withMessage('canSwim must be true or false'),
    body('canWalk').isBoolean().withMessage('canWalk must be true or false'),
    body('canRun').isBoolean().withMessage('canRun must be true or false'),
    body('canYoga').isBoolean().withMessage('canYoga must be true or false'),
    body('maxTimeMinutes')
      .isInt({ min: 10, max: 180 })
      .withMessage('Exercise time must be between 10 and 180 minutes')
  ],

  // Calorie log validation
  calorieLog: [
    body('caloriesConsumed')
      .isInt({ min: 0, max: 10000 })
      .withMessage('Calories must be between 0 and 10000'),
    body('proteinConsumed')
      .optional()
      .isInt({ min: 0, max: 1000 })
      .withMessage('Protein must be between 0 and 1000g'),
    body('carbsConsumed')
      .optional()
      .isInt({ min: 0, max: 2000 })
      .withMessage('Carbs must be between 0 and 2000g'),
    body('fatsConsumed')
      .optional()
      .isInt({ min: 0, max: 500 })
      .withMessage('Fats must be between 0 and 500g')
  ],

  // Exercise log validation
  exerciseLog: [
    body('exerciseType')
      .notEmpty()
      .withMessage('Exercise type is required'),
    body('durationMinutes')
      .isInt({ min: 1, max: 480 })
      .withMessage('Duration must be between 1 and 480 minutes'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters')
  ],

  // Recipe request validation
  recipeRequest: [
    body('dishName')
      .notEmpty()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Dish name must be between 2 and 100 characters')
  ],

  // Ingredients validation
  ingredientsRequest: [
    body('ingredients')
      .isArray({ min: 1 })
      .withMessage('At least one ingredient is required'),
    body('ingredients.*')
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Each ingredient must be between 1 and 50 characters')
  ]
};

module.exports = { validate, validationRules };
