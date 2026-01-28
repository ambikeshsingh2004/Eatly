const supabase = require('../config/supabase');
const streakService = require('../services/streakService');

/**
 * Log Calorie Intake
 * Records daily calorie intake and updates streak
 */
const logCalories = async (req, res, next) => {
  try {
    const { user } = req;
    const { caloriesConsumed, proteinConsumed, carbsConsumed, fatsConsumed } = req.body;

    // Get user's daily targets
    const { data: profile } = await supabase
      .from('profiles')
      .select('daily_calories, daily_protein, daily_carbs, daily_fats')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile first'
      });
    }

    const today = streakService.getTodayDate();

    // Check if already logged today
    const { data: existingLog } = await supabase
      .from('calorie_logs')
      .select('id')
      .eq('user_id', user.id)
      .eq('log_date', today)
      .single();

    // Determine if goal was met (within 10% tolerance)
    const calorieTarget = profile.daily_calories;
    const tolerance = calorieTarget * 0.1;
    const metGoal = caloriesConsumed >= (calorieTarget - tolerance) &&
      caloriesConsumed <= (calorieTarget + tolerance);

    const logData = {
      user_id: user.id,
      log_date: today,
      calories_consumed: caloriesConsumed,
      protein_consumed: proteinConsumed || 0,
      carbs_consumed: carbsConsumed || 0,
      fats_consumed: fatsConsumed || 0,
      met_goal: metGoal
    };

    if (existingLog) {
      // Update existing log
      await supabase
        .from('calorie_logs')
        .update(logData)
        .eq('id', existingLog.id);
    } else {
      // Create new log
      await supabase
        .from('calorie_logs')
        .insert(logData);
    }

    // Update streak
    const streakResult = await streakService.updateCalorieStreak(user.id, metGoal);

    res.json({
      success: true,
      message: 'Calorie intake logged successfully',
      data: {
        logged: {
          calories: caloriesConsumed,
          protein: proteinConsumed || 0,
          carbs: carbsConsumed || 0,
          fats: fatsConsumed || 0
        },
        targets: {
          calories: profile.daily_calories,
          protein: profile.daily_protein,
          carbs: profile.daily_carbs,
          fats: profile.daily_fats
        },
        metGoal,
        streak: streakResult
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log Exercise
 * Records daily exercise and updates streak
 */
const logExercise = async (req, res, next) => {
  try {
    const { user } = req;
    const { exerciseType, durationMinutes, notes, metGoal } = req.body;

    const today = streakService.getTodayDate();

    // Check if already logged today
    const { data: existingLog } = await supabase
      .from('exercise_logs')
      .select('id')
      .eq('user_id', user.id)
      .eq('log_date', today)
      .single();

    const logData = {
      user_id: user.id,
      log_date: today,
      exercise_type: exerciseType,
      duration_minutes: durationMinutes,
      notes: notes || '',
      met_goal: metGoal !== undefined ? metGoal : true
    };

    if (existingLog) {
      await supabase
        .from('exercise_logs')
        .update(logData)
        .eq('id', existingLog.id);
    } else {
      await supabase
        .from('exercise_logs')
        .insert(logData);
    }

    // Update streak
    const streakResult = await streakService.updateExerciseStreak(user.id, logData.met_goal);

    res.json({
      success: true,
      message: 'Exercise logged successfully',
      data: {
        logged: {
          exerciseType,
          durationMinutes,
          notes: notes || ''
        },
        metGoal: logData.met_goal,
        streak: streakResult
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Streaks
 * Returns current streak status for both calories and exercise
 */
const getStreaks = async (req, res, next) => {
  try {
    const { user } = req;

    const streaks = await streakService.getStreaks(user.id);

    res.json({
      success: true,
      data: streaks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get History
 * Returns log history for past days
 */
const getHistory = async (req, res, next) => {
  try {
    const { user } = req;
    const { days = 7, type = 'all' } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    const startDateStr = startDate.toISOString().split('T')[0];

    let calorieHistory = [];
    let exerciseHistory = [];

    if (type === 'all' || type === 'calories') {
      const { data: calorieLogs } = await supabase
        .from('calorie_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('log_date', startDateStr)
        .order('log_date', { ascending: false });

      calorieHistory = (calorieLogs || []).map(log => ({
        date: log.log_date,
        calories: log.calories_consumed,
        protein: log.protein_consumed,
        carbs: log.carbs_consumed,
        fats: log.fats_consumed,
        metGoal: log.met_goal
      }));
    }

    if (type === 'all' || type === 'exercise') {
      const { data: exerciseLogs } = await supabase
        .from('exercise_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('log_date', startDateStr)
        .order('log_date', { ascending: false });

      exerciseHistory = (exerciseLogs || []).map(log => ({
        date: log.log_date,
        exerciseType: log.exercise_type,
        durationMinutes: log.duration_minutes,
        notes: log.notes,
        metGoal: log.met_goal
      }));
    }

    res.json({
      success: true,
      data: {
        calorieHistory,
        exerciseHistory,
        period: `Last ${days} days`
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  logCalories,
  logExercise,
  getStreaks,
  getHistory
};
