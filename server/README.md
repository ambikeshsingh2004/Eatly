# Eatly Backend API

AI-powered nutrition and meal planning backend built with Express.js, Supabase, and Google Gemini.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Set Up Database
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open your project → SQL Editor
3. Copy contents of `database/schema.sql` and run it

### 3. Start Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server runs on `http://localhost:5000`

---

## 📁 Project Structure

```
server/
├── config/
│   ├── supabase.js      # Supabase client
│   └── gemini.js        # Gemini AI client
├── controllers/
│   ├── authController.js
│   ├── profileController.js
│   ├── ingredientController.js
│   ├── groceryController.js
│   ├── recipeController.js
│   └── streakController.js
├── middleware/
│   ├── authMiddleware.js
│   ├── errorHandler.js
│   └── validator.js
├── routes/
│   ├── authRoutes.js
│   ├── profileRoutes.js
│   ├── ingredientRoutes.js
│   ├── groceryRoutes.js
│   ├── recipeRoutes.js
│   └── streakRoutes.js
├── services/
│   ├── geminiService.js
│   ├── nutritionService.js
│   └── streakService.js
├── database/
│   └── schema.sql
├── .env
├── .gitignore
├── package.json
└── server.js
```

---

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout (requires auth) |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/user` | Get current user (requires auth) |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/profile/onboarding` | Complete onboarding |
| GET | `/api/profile` | Get user profile |
| PUT | `/api/profile` | Update profile |
| GET | `/api/profile/macros` | Get nutrition targets |

### Feature 1: Ingredient Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ingredients/analyze` | Analyze image for ingredients |
| POST | `/api/ingredients/suggest-recipes` | Get recipe suggestions |

### Feature 2: Grocery Planning
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/grocery/meal-plan?days=3` | Get meal plan with grocery list |

### Feature 3: Recipe Finder
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/recipes/get` | Get detailed recipe for a dish |

### Streak Tracking
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/streaks/calorie-log` | Log daily calories |
| POST | `/api/streaks/exercise-log` | Log daily exercise |
| GET | `/api/streaks` | Get current streaks |
| GET | `/api/streaks/history?days=7` | Get log history |

---

## 🔐 Authentication

All protected endpoints require Bearer token:
```
Authorization: Bearer <access_token>
```

Token is received after login/signup.

---

## 📝 Example Requests

### Signup
```json
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

### Onboarding
```json
POST /api/profile/onboarding
{
  "fullName": "John Doe",
  "age": 25,
  "gender": "male",
  "weight": 70,
  "height": 175,
  "dietType": "non-vegetarian",
  "goal": "muscle_gain",
  "activityLevel": "moderate",
  "exercisePreferences": {
    "canGoGym": true,
    "homeWorkout": true,
    "canCycle": false,
    "canSwim": false,
    "canWalk": true,
    "canRun": true,
    "canYoga": false,
    "maxTimeMinutes": 60
  }
}
```

### Analyze Image
```json
POST /api/ingredients/analyze
{
  "image": "<base64_encoded_image>",
  "mimeType": "image/jpeg"
}
```

### Get Recipe
```json
POST /api/recipes/get
{
  "dishName": "Butter Chicken"
}
```

---

## 🛠️ Environment Variables

```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
GEMINI_API_KEY=your_gemini_key
JWT_SECRET=your_jwt_secret
```

---

## 📦 Dependencies

- **express** - Web framework
- **cors** - Cross-origin resource sharing
- **helmet** - Security headers
- **morgan** - HTTP request logging
- **dotenv** - Environment variables
- **@supabase/supabase-js** - Supabase client
- **@google/generative-ai** - Gemini AI
- **express-validator** - Input validation
- **multer** - File uploads

---

## 🧪 Testing

Health check:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Eatly API is running",
  "timestamp": "2024-01-28T16:00:00.000Z",
  "version": "1.0.0"
}
```
