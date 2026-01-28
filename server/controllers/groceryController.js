const supabase = require('../config/supabase');
const geminiService = require('../services/geminiService');

/**
 * Get Meal Plan
 * Generates a personalized meal plan with grocery list
 */
const getMealPlan = async (req, res, next) => {
  try {
    const { user } = req;
    const { days = 3 } = req.query;

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile || !profile.onboarding_complete) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile first'
      });
    }

    const userProfile = {
      dietType: profile.diet_type,
      goal: profile.goal,
      dailyCalories: profile.daily_calories,
      dailyProtein: profile.daily_protein,
      dailyCarbs: profile.daily_carbs,
      dailyFats: profile.daily_fats
    };

    const result = await geminiService.generateMealPlan(userProfile, parseInt(days));

    res.json({
      success: true,
      message: `${days}-day meal plan generated successfully`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMealPlan
};
