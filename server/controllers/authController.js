const supabase = require('../config/supabase');

/**
 * User Signup
 * Creates a new user account with Supabase Auth
 */
const signup = async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for now
      user_metadata: {
        full_name: fullName || ''
      }
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Create profile entry for the user
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: email,
        full_name: fullName || '',
        onboarding_complete: false
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // User created but profile failed - log but don't fail
    }

    // Create initial streak record
    const { error: streakError } = await supabase
      .from('streaks')
      .insert({
        user_id: data.user.id,
        calorie_streak: 0,
        calorie_best_streak: 0,
        exercise_streak: 0,
        exercise_best_streak: 0
      });

    if (streakError) {
      console.error('Streak creation error:', streakError);
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          fullName: fullName || ''
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User Login
 * Authenticates user and returns session token
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          fullName: profile?.full_name || ''
        },
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresIn: data.session.expires_in,
          expiresAt: data.session.expires_at
        },
        onboardingComplete: profile?.onboarding_complete || false
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User Logout
 * Invalidates the current session
 */
const logout = async (req, res, next) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current User
 * Returns the authenticated user's information
 */
const getUser = async (req, res, next) => {
  try {
    const { user } = req;

    // Get profile data
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
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
        user: {
          id: user.id,
          email: user.email,
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
          onboardingComplete: profile.onboarding_complete
        },
        exercisePreferences: exercisePrefs || null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh Token
 * Refreshes the access token using refresh token
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    res.json({
      success: true,
      data: {
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresIn: data.session.expires_in,
          expiresAt: data.session.expires_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  logout,
  getUser,
  refreshToken
};
