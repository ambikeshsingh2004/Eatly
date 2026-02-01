const supabase = require('../config/supabase');
const geminiService = require('../services/geminiService');

/**
 * Get Recipe Details
 * Returns detailed recipe for a specific dish
 */
const getRecipe = async (req, res, next) => {
  try {
    const { user } = req;
    const { dishName } = req.body;

    if (!dishName || dishName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid dish name'
      });
    }

    // Get user profile for dietary preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('diet_type, language')
      .eq('id', user.id)
      .single();

    const userProfile = {
      dietType: profile?.diet_type || 'non-vegetarian',
      language: profile?.language || 'English'
    };

    const result = await geminiService.getRecipeDetails(dishName.trim(), userProfile);

    res.json({
      success: true,
      message: 'Recipe retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecipe
};
