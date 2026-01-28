/**
 * Nutrition Service
 * Calculates daily calorie and macro targets based on user profile
 */

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} gender - 'male', 'female', or 'other'
 * @returns {number} BMR in calories
 */
const calculateBMR = (weight, height, age, gender) => {
  // Mifflin-St Jeor Equation
  // Men: BMR = 10W + 6.25H - 5A + 5
  // Women: BMR = 10W + 6.25H - 5A - 161

  const baseBMR = (10 * weight) + (6.25 * height) - (5 * age);

  if (gender === 'male') {
    return Math.round(baseBMR + 5);
  } else if (gender === 'female') {
    return Math.round(baseBMR - 161);
  } else {
    // For 'other', use average of male and female
    return Math.round(baseBMR - 78);
  }
};

/**
 * Get activity level multiplier for TDEE calculation
 * @param {string} activityLevel - Activity level
 * @returns {number} Multiplier
 */
const getActivityMultiplier = (activityLevel) => {
  const multipliers = {
    sedentary: 1.2,      // Little or no exercise
    light: 1.375,        // Light exercise 1-3 days/week
    moderate: 1.55,      // Moderate exercise 3-5 days/week
    active: 1.725,       // Hard exercise 6-7 days/week
    very_active: 1.9     // Very hard exercise, physical job
  };

  return multipliers[activityLevel] || 1.2;
};

/**
 * Get goal adjustment for calories
 * @param {string} goal - User's fitness goal
 * @returns {object} Calorie adjustment and macro ratios
 */
const getGoalAdjustment = (goal) => {
  const adjustments = {
    weight_loss: {
      calorieAdjustment: -500, // Deficit for weight loss
      proteinRatio: 0.35,      // Higher protein to preserve muscle
      carbRatio: 0.35,
      fatRatio: 0.30
    },
    muscle_gain: {
      calorieAdjustment: 300,  // Surplus for muscle building
      proteinRatio: 0.30,      // High protein for muscle synthesis
      carbRatio: 0.45,         // Higher carbs for energy
      fatRatio: 0.25
    },
    weight_gain: {
      calorieAdjustment: 500,  // Larger surplus
      proteinRatio: 0.25,
      carbRatio: 0.50,
      fatRatio: 0.25
    },
    maintain: {
      calorieAdjustment: 0,    // No adjustment
      proteinRatio: 0.25,
      carbRatio: 0.50,
      fatRatio: 0.25
    },
    athletic: {
      calorieAdjustment: 200,
      proteinRatio: 0.30,
      carbRatio: 0.45,
      fatRatio: 0.25
    }
  };

  return adjustments[goal] || adjustments.maintain;
};

/**
 * Calculate daily nutrition targets
 * @param {object} profile - User profile data
 * @returns {object} Daily targets for calories and macros
 */
const calculateDailyTargets = (profile) => {
  const { weight, height, age, gender, activityLevel, goal } = profile;

  // Step 1: Calculate BMR
  const bmr = calculateBMR(weight, height, age, gender);

  // Step 2: Calculate TDEE (Total Daily Energy Expenditure)
  const activityMultiplier = getActivityMultiplier(activityLevel);
  const tdee = Math.round(bmr * activityMultiplier);

  // Step 3: Adjust for goal
  const goalAdjustment = getGoalAdjustment(goal);
  const dailyCalories = Math.max(1200, tdee + goalAdjustment.calorieAdjustment);

  // Step 4: Calculate macros
  // Protein: 4 calories per gram
  // Carbs: 4 calories per gram
  // Fat: 9 calories per gram
  const dailyProtein = Math.round((dailyCalories * goalAdjustment.proteinRatio) / 4);
  const dailyCarbs = Math.round((dailyCalories * goalAdjustment.carbRatio) / 4);
  const dailyFats = Math.round((dailyCalories * goalAdjustment.fatRatio) / 9);

  return {
    bmr,
    tdee,
    dailyCalories,
    dailyProtein,
    dailyCarbs,
    dailyFats,
    macroRatios: {
      protein: Math.round(goalAdjustment.proteinRatio * 100),
      carbs: Math.round(goalAdjustment.carbRatio * 100),
      fats: Math.round(goalAdjustment.fatRatio * 100)
    }
  };
};

/**
 * Get recommended exercise based on user profile
 * @param {object} profile - User profile
 * @param {object} exercisePrefs - Exercise preferences
 * @returns {object} Exercise recommendations
 */
const getExerciseRecommendations = (profile, exercisePrefs) => {
  const { goal } = profile;
  const recommendations = [];

  if (!exercisePrefs) {
    return { recommendations: [], weeklyPlan: null };
  }

  const { canGoGym, homeWorkout, canCycle, canSwim, canWalk, canRun, canYoga, maxTimeMinutes } = exercisePrefs;

  // Build recommendations based on goal and available options
  if (goal === 'muscle_gain') {
    if (canGoGym) {
      recommendations.push({
        type: 'Weight Training',
        frequency: '4-5 days/week',
        duration: Math.min(maxTimeMinutes, 60),
        description: 'Focus on compound movements: squats, deadlifts, bench press, rows'
      });
    }
    if (homeWorkout) {
      recommendations.push({
        type: 'Bodyweight Training',
        frequency: '3-4 days/week',
        duration: Math.min(maxTimeMinutes, 45),
        description: 'Push-ups, pull-ups, squats, lunges with progressive overload'
      });
    }
  } else if (goal === 'weight_loss') {
    if (canRun) {
      recommendations.push({
        type: 'Running/Jogging',
        frequency: '3-4 days/week',
        duration: Math.min(maxTimeMinutes, 30),
        description: 'Moderate intensity cardio, mix with intervals'
      });
    }
    if (canCycle) {
      recommendations.push({
        type: 'Cycling',
        frequency: '3-4 days/week',
        duration: Math.min(maxTimeMinutes, 45),
        description: 'Great low-impact cardio option'
      });
    }
    if (canGoGym || homeWorkout) {
      recommendations.push({
        type: 'Strength Training',
        frequency: '2-3 days/week',
        duration: Math.min(maxTimeMinutes, 30),
        description: 'Build muscle to boost metabolism'
      });
    }
  } else if (goal === 'maintain' || goal === 'athletic') {
    if (canSwim) {
      recommendations.push({
        type: 'Swimming',
        frequency: '2-3 days/week',
        duration: Math.min(maxTimeMinutes, 45),
        description: 'Full body workout, great for recovery'
      });
    }
    if (canYoga) {
      recommendations.push({
        type: 'Yoga',
        frequency: '2-3 days/week',
        duration: Math.min(maxTimeMinutes, 30),
        description: 'Flexibility and mental wellness'
      });
    }
  }

  // Always recommend walking for everyone
  if (canWalk && recommendations.length < 3) {
    recommendations.push({
      type: 'Walking',
      frequency: 'Daily',
      duration: Math.min(maxTimeMinutes, 30),
      description: 'Aim for 7,000-10,000 steps daily'
    });
  }

  return {
    recommendations: recommendations.slice(0, 3), // Max 3 recommendations
    dailyTargetMinutes: maxTimeMinutes
  };
};

module.exports = {
  calculateBMR,
  calculateDailyTargets,
  getExerciseRecommendations
};
