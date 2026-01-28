const supabase = require('../config/supabase');
const { calculateDailyTargets, getExerciseRecommendations } = require('../services/nutritionService');

/**
 * Complete Onboarding
 * Saves user profile data and calculates nutrition targets
 */
const completeOnboarding = async (req, res, next) => {
  try {
    const { user } = req;
    const {
      fullName,
      age,
      gender,
      weight,
      height,
      dietType,
      goal,
      activityLevel,
      exercisePreferences
    } = req.body;

    // Calculate daily nutrition targets
    const targets = calculateDailyTargets({
      weight,
      height,
      age,
      gender,
      activityLevel,
      goal
    });

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        age,
        gender,
        weight,
        height,
        diet_type: dietType,
        goal,
        activity_level: activityLevel,
        daily_calories: targets.dailyCalories,
        daily_protein: targets.dailyProtein,
        daily_carbs: targets.dailyCarbs,
        daily_fats: targets.dailyFats,
        onboarding_complete: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (profileError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to save profile: ' + profileError.message
      });
    }

    // Save exercise preferences if provided
    if (exercisePreferences) {
      // Check if preferences exist
      const { data: existingPrefs } = await supabase
        .from('exercise_preferences')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const exerciseData = {
        user_id: user.id,
        can_go_gym: exercisePreferences.canGoGym || false,
        home_workout: exercisePreferences.homeWorkout || false,
        can_cycle: exercisePreferences.canCycle || false,
        can_swim: exercisePreferences.canSwim || false,
        can_walk: exercisePreferences.canWalk || false,
        can_run: exercisePreferences.canRun || false,
        can_yoga: exercisePreferences.canYoga || false,
        max_time_minutes: exercisePreferences.maxTimeMinutes || 30
      };

      if (existingPrefs) {
        await supabase
          .from('exercise_preferences')
          .update(exerciseData)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('exercise_preferences')
          .insert(exerciseData);
      }
    }

    // Get exercise recommendations
    const exerciseRecs = getExerciseRecommendations(
      { goal },
      exercisePreferences
    );

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: {
        nutritionTargets: {
          dailyCalories: targets.dailyCalories,
          dailyProtein: targets.dailyProtein,
          dailyCarbs: targets.dailyCarbs,
          dailyFats: targets.dailyFats,
          macroRatios: targets.macroRatios
        },
        exerciseRecommendations: exerciseRecs
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Profile
 * Returns the user's complete profile
 */
const getProfile = async (req, res, next) => {
  try {
    const { user } = req;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Get exercise preferences
    const { data: exercisePrefs } = await supabase
      .from('exercise_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    res.json({
      success: true,
      data: {
        profile: {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          age: profile.age,
          gender: profile.gender,
          weight: profile.weight,
          height: profile.height,
          dietType: profile.diet_type,
          goal: profile.goal,
          activityLevel: profile.activity_level,
          dailyCalories: profile.daily_calories,
          dailyProtein: profile.daily_protein,
          dailyCarbs: profile.daily_carbs,
          dailyFats: profile.daily_fats,
          onboardingComplete: profile.onboarding_complete,
          createdAt: profile.created_at
        },
        exercisePreferences: exercisePrefs ? {
          canGoGym: exercisePrefs.can_go_gym,
          homeWorkout: exercisePrefs.home_workout,
          canCycle: exercisePrefs.can_cycle,
          canSwim: exercisePrefs.can_swim,
          canWalk: exercisePrefs.can_walk,
          canRun: exercisePrefs.can_run,
          canYoga: exercisePrefs.can_yoga,
          maxTimeMinutes: exercisePrefs.max_time_minutes
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Profile
 * Updates specific profile fields
 */
const updateProfile = async (req, res, next) => {
  try {
    const { user } = req;
    const updates = req.body;

    // Map camelCase to snake_case for database
    const dbUpdates = {};
    const fieldMapping = {
      fullName: 'full_name',
      age: 'age',
      gender: 'gender',
      weight: 'weight',
      height: 'height',
      dietType: 'diet_type',
      goal: 'goal',
      activityLevel: 'activity_level'
    };

    for (const [key, value] of Object.entries(updates)) {
      if (fieldMapping[key]) {
        dbUpdates[fieldMapping[key]] = value;
      }
    }

    // Recalculate targets if relevant fields changed
    if (updates.weight || updates.height || updates.age || updates.gender || updates.activityLevel || updates.goal) {
      // Get current profile for missing fields
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const profileForCalc = {
        weight: updates.weight || currentProfile.weight,
        height: updates.height || currentProfile.height,
        age: updates.age || currentProfile.age,
        gender: updates.gender || currentProfile.gender,
        activityLevel: updates.activityLevel || currentProfile.activity_level,
        goal: updates.goal || currentProfile.goal
      };

      const targets = calculateDailyTargets(profileForCalc);
      dbUpdates.daily_calories = targets.dailyCalories;
      dbUpdates.daily_protein = targets.dailyProtein;
      dbUpdates.daily_carbs = targets.dailyCarbs;
      dbUpdates.daily_fats = targets.dailyFats;
    }

    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', user.id);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update profile: ' + error.message
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Macro Targets
 * Returns calculated nutrition targets
 */
const getMacros = async (req, res, next) => {
  try {
    const { user } = req;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('daily_calories, daily_protein, daily_carbs, daily_fats, goal')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        dailyCalories: profile.daily_calories,
        dailyProtein: profile.daily_protein,
        dailyCarbs: profile.daily_carbs,
        dailyFats: profile.daily_fats,
        goal: profile.goal
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  completeOnboarding,
  getProfile,
  updateProfile,
  getMacros
};
