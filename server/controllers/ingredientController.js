const supabase = require('../config/supabase');
const geminiService = require('../services/geminiService');

/**
 * Analyze Image for Ingredients
 * Detects ingredients from uploaded image
 */
const analyzeImage = async (req, res, next) => {
  try {
    const { image, mimeType } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Image is required. Send base64 encoded image.'
      });
    }

    // Remove data URL prefix if present
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '');
    const imageType = mimeType || 'image/jpeg';

    const result = await geminiService.detectIngredients(base64Image, imageType);

    res.json({
      success: true,
      message: 'Image analyzed successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Suggest Recipes from Ingredients
 * Generates recipe suggestions based on available ingredients
 */
const suggestRecipes = async (req, res, next) => {
  try {
    const { user } = req;
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one ingredient'
      });
    }

    // Get user profile for dietary preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('diet_type, goal, daily_calories')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile first'
      });
    }

    const userProfile = {
      dietType: profile.diet_type || 'non-vegetarian',
      goal: profile.goal || 'maintain',
      dailyCalories: profile.daily_calories || 2000
    };

    const result = await geminiService.generateRecipeSuggestions(ingredients, userProfile);

    res.json({
      success: true,
      message: 'Recipes generated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeImage,
  suggestRecipes
};
