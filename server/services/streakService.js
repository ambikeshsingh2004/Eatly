const supabase = require('../config/supabase');

/**
 * Streak Service
 * Handles streak calculation and updates
 */

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Date string
 */
const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Get yesterday's date in YYYY-MM-DD format
 * @returns {string} Date string
 */
const getYesterdayDate = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

/**
 * Calculate if streak continues or resets
 * @param {string} lastLogDate - Last log date
 * @returns {object} Streak action
 */
const calculateStreakAction = (lastLogDate) => {
  const today = getTodayDate();
  const yesterday = getYesterdayDate();

  if (!lastLogDate) {
    // First log ever
    return { action: 'start', newStreak: 1 };
  }

  if (lastLogDate === today) {
    // Already logged today
    return { action: 'already_logged', newStreak: null };
  }

  if (lastLogDate === yesterday) {
    // Consecutive day - continue streak
    return { action: 'continue', increment: 1 };
  }

  // Gap in streak - reset
  return { action: 'reset', newStreak: 1 };
};

/**
 * Update calorie streak for a user
 * @param {string} userId - User ID
 * @param {boolean} metGoal - Did user meet their calorie goal
 * @returns {Promise<object>} Updated streak info
 */
const updateCalorieStreak = async (userId, metGoal) => {
  // Get current streak data
  const { data: streakData, error: fetchError } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw new Error('Failed to fetch streak data');
  }

  const today = getTodayDate();

  // Initialize if no streak record exists
  if (!streakData) {
    const newStreak = metGoal ? 1 : 0;
    const { error: insertError } = await supabase
      .from('streaks')
      .insert({
        user_id: userId,
        calorie_streak: newStreak,
        calorie_best_streak: newStreak,
        exercise_streak: 0,
        exercise_best_streak: 0,
        last_calorie_log: today
      });

    if (insertError) throw insertError;

    return {
      currentStreak: newStreak,
      bestStreak: newStreak,
      action: 'started'
    };
  }

  const streakAction = calculateStreakAction(streakData.last_calorie_log);
  let newStreak = streakData.calorie_streak;

  if (streakAction.action === 'already_logged') {
    return {
      currentStreak: newStreak,
      bestStreak: streakData.calorie_best_streak,
      action: 'already_logged_today'
    };
  }

  if (metGoal) {
    if (streakAction.action === 'continue') {
      newStreak = streakData.calorie_streak + 1;
    } else {
      newStreak = 1;
    }
  } else {
    newStreak = 0; // Reset streak if goal not met
  }

  const newBestStreak = Math.max(newStreak, streakData.calorie_best_streak);

  const { error: updateError } = await supabase
    .from('streaks')
    .update({
      calorie_streak: newStreak,
      calorie_best_streak: newBestStreak,
      last_calorie_log: today,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (updateError) throw updateError;

  return {
    currentStreak: newStreak,
    bestStreak: newBestStreak,
    action: streakAction.action
  };
};

/**
 * Update exercise streak for a user
 * @param {string} userId - User ID
 * @param {boolean} metGoal - Did user meet their exercise goal
 * @returns {Promise<object>} Updated streak info
 */
const updateExerciseStreak = async (userId, metGoal) => {
  const { data: streakData, error: fetchError } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw new Error('Failed to fetch streak data');
  }

  const today = getTodayDate();

  if (!streakData) {
    const newStreak = metGoal ? 1 : 0;
    const { error: insertError } = await supabase
      .from('streaks')
      .insert({
        user_id: userId,
        calorie_streak: 0,
        calorie_best_streak: 0,
        exercise_streak: newStreak,
        exercise_best_streak: newStreak,
        last_exercise_log: today
      });

    if (insertError) throw insertError;

    return {
      currentStreak: newStreak,
      bestStreak: newStreak,
      action: 'started'
    };
  }

  const streakAction = calculateStreakAction(streakData.last_exercise_log);
  let newStreak = streakData.exercise_streak;

  if (streakAction.action === 'already_logged') {
    return {
      currentStreak: newStreak,
      bestStreak: streakData.exercise_best_streak,
      action: 'already_logged_today'
    };
  }

  if (metGoal) {
    if (streakAction.action === 'continue') {
      newStreak = streakData.exercise_streak + 1;
    } else {
      newStreak = 1;
    }
  } else {
    newStreak = 0;
  }

  const newBestStreak = Math.max(newStreak, streakData.exercise_best_streak);

  const { error: updateError } = await supabase
    .from('streaks')
    .update({
      exercise_streak: newStreak,
      exercise_best_streak: newBestStreak,
      last_exercise_log: today,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (updateError) throw updateError;

  return {
    currentStreak: newStreak,
    bestStreak: newBestStreak,
    action: streakAction.action
  };
};

/**
 * Get user's current streaks
 * @param {string} userId - User ID
 * @returns {Promise<object>} Streak data
 */
const getStreaks = async (userId) => {
  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  if (!data) {
    return {
      calorieStreak: 0,
      calorieBestStreak: 0,
      exerciseStreak: 0,
      exerciseBestStreak: 0,
      lastCalorieLog: null,
      lastExerciseLog: null
    };
  }

  return {
    calorieStreak: data.calorie_streak,
    calorieBestStreak: data.calorie_best_streak,
    exerciseStreak: data.exercise_streak,
    exerciseBestStreak: data.exercise_best_streak,
    lastCalorieLog: data.last_calorie_log,
    lastExerciseLog: data.last_exercise_log
  };
};

module.exports = {
  getTodayDate,
  updateCalorieStreak,
  updateExerciseStreak,
  getStreaks
};
