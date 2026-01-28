import api from './api';

// ==================== AUTH ====================
export const authService = {
  signup: async (email, password, fullName) => {
    const response = await api.post('/auth/signup', { email, password, fullName });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      const { accessToken, refreshToken } = response.data.data.session;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  getUser: async () => {
    const response = await api.get('/auth/user');
    return response.data;
  }
};

// ==================== PROFILE ====================
export const profileService = {
  completeOnboarding: async (data) => {
    const response = await api.post('/profile/onboarding', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/profile', data);
    return response.data;
  },

  getMacros: async () => {
    const response = await api.get('/profile/macros');
    return response.data;
  }
};

// ==================== INGREDIENTS ====================
export const ingredientService = {
  analyzeImage: async (imageBase64, mimeType = 'image/jpeg') => {
    const response = await api.post('/ingredients/analyze', {
      image: imageBase64,
      mimeType
    });
    return response.data;
  },

  suggestRecipes: async (ingredients) => {
    const response = await api.post('/ingredients/suggest-recipes', { ingredients });
    return response.data;
  }
};

// ==================== GROCERY ====================
export const groceryService = {
  getMealPlan: async (days = 3) => {
    const response = await api.get(`/grocery/meal-plan?days=${days}`);
    return response.data;
  }
};

// ==================== RECIPES ====================
export const recipeService = {
  getRecipe: async (dishName) => {
    const response = await api.post('/recipes/get', { dishName });
    return response.data;
  }
};

// ==================== STREAKS ====================
export const streakService = {
  logCalories: async (data) => {
    const response = await api.post('/streaks/calorie-log', data);
    return response.data;
  },

  logExercise: async (data) => {
    const response = await api.post('/streaks/exercise-log', data);
    return response.data;
  },

  getStreaks: async () => {
    const response = await api.get('/streaks');
    return response.data;
  },

  getHistory: async (days = 7, type = 'all') => {
    const response = await api.get(`/streaks/history?days=${days}&type=${type}`);
    return response.data;
  }
};
