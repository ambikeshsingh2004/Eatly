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

// ==================== Security Middleware ====================
app.use(helmet());

// ==================== CORS Configuration ====================
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL
]
  .filter(Boolean)
  .map(o => o.replace(/\/$/, ""));

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser requests (Postman, curl, health checks)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, "");

    // ✅ FINAL FIX: allow Vercel + exact matches
    if (
      // Allow Vercel deployments (prod + preview)
      allowedOrigins.includes(normalizedOrigin) ||
      normalizedOrigin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    }

    console.error("❌ CORS blocked:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Handle preflight requests
app.options('*', cors());

// Log allowed origins once at startup
console.log("✅ Allowed CORS Origins:", allowedOrigins);

// ==================== Logging ====================
app.use(morgan('dev'));

// ==================== Body Parsing ====================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== Health Check ====================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Eatly API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ==================== API Routes ====================
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/grocery', groceryRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/streaks', streakRoutes);

// ==================== 404 Handler ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ==================== Global Error Handler ====================
app.use(errorHandler);

// ==================== Start Server ====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 Eatly API Server');
  console.log('='.repeat(50));
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(50));
});

module.exports = app;
