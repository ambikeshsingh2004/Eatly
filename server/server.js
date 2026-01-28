require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const ingredientRoutes = require('./routes/ingredientRoutes');
const groceryRoutes = require('./routes/groceryRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const streakRoutes = require('./routes/streakRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Logging middleware
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Increased for image uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Eatly API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ==================== API Routes ====================

// Auth Routes - Signup, Login, Logout
app.use('/api/auth', authRoutes);

// Profile Routes - Onboarding, Profile CRUD, Macros
app.use('/api/profile', profileRoutes);

// Feature 1: Ingredient Analysis Routes
// - Analyze image for ingredients
// - Get recipe suggestions from ingredients
app.use('/api/ingredients', ingredientRoutes);

// Feature 2: Grocery Planning Routes
// - Generate meal plan with grocery list
app.use('/api/grocery', groceryRoutes);

// Feature 3: Recipe Routes
// - Get detailed recipe for a dish
app.use('/api/recipes', recipeRoutes);

// Streak Tracking Routes
// - Log calories, Log exercise
// - Get streaks, Get history
app.use('/api/streaks', streakRoutes);

// ==================== Error Handling ====================

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use(errorHandler);

// ==================== Start Server ====================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Eatly API Server`);
  console.log('='.repeat(50));
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(50));
  console.log('Available Routes:');
  console.log('  POST /api/auth/signup');
  console.log('  POST /api/auth/login');
  console.log('  POST /api/profile/onboarding');
  console.log('  POST /api/ingredients/analyze');
  console.log('  POST /api/ingredients/suggest-recipes');
  console.log('  GET  /api/grocery/meal-plan');
  console.log('  POST /api/recipes/get');
  console.log('  POST /api/streaks/calorie-log');
  console.log('  POST /api/streaks/exercise-log');
  console.log('  GET  /api/streaks');
  console.log('='.repeat(50));
});

module.exports = app;
