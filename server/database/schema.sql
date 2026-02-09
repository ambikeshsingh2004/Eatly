-- Eatly Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- =============================================
-- Table: profiles
-- Stores user profile and nutrition targets
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'othe')),
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  diet_type TEXT CHECK (diet_type IN ('vegetarian', 'non-vegetarian', 'vegan', 'eggetarian')),
  goal TEXT CHECK (goal IN ('muscle_gain', 'weight_loss', 'weight_gain', 'maintain', 'athletic')),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  daily_calories INTEGER,
  daily_protein INTEGER,
  daily_carbs INTEGER,
  daily_fats INTEGER,
  language TEXT DEFAULT 'English',
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Table: exercise_preferences
-- Stores user's exercise capabilities and time
-- =============================================
CREATE TABLE IF NOT EXISTS exercise_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  can_go_gym BOOLEAN DEFAULT FALSE,
  home_workout BOOLEAN DEFAULT FALSE,
  can_cycle BOOLEAN DEFAULT FALSE,
  can_swim BOOLEAN DEFAULT FALSE,
  can_walk BOOLEAN DEFAULT FALSE,
  can_run BOOLEAN DEFAULT FALSE,
  can_yoga BOOLEAN DEFAULT FALSE,
  max_time_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =============================================
-- Table: calorie_logs
-- Tracks daily calorie and macro intake
-- =============================================
CREATE TABLE IF NOT EXISTS calorie_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  calories_consumed INTEGER NOT NULL,
  protein_consumed INTEGER DEFAULT 0,
  carbs_consumed INTEGER DEFAULT 0,
  fats_consumed INTEGER DEFAULT 0,
  met_goal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- =============================================
-- Table: exercise_logs
-- Tracks daily exercise activities
-- =============================================
CREATE TABLE IF NOT EXISTS exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  exercise_type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  met_goal BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- =============================================
-- Table: streaks
-- Tracks calorie and exercise streaks
-- =============================================
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  calorie_streak INTEGER DEFAULT 0,
  calorie_best_streak INTEGER DEFAULT 0,
  exercise_streak INTEGER DEFAULT 0,
  exercise_best_streak INTEGER DEFAULT 0,
  last_calorie_log DATE,
  last_exercise_log DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =============================================
-- Indexes for better query performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_calorie_logs_user_date ON calorie_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_user_date ON exercise_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_streaks_user ON streaks(user_id);

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE calorie_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Exercise preferences policies
CREATE POLICY "Users can view own exercise preferences" ON exercise_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own exercise preferences" ON exercise_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Calorie logs policies
CREATE POLICY "Users can view own calorie logs" ON calorie_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own calorie logs" ON calorie_logs
  FOR ALL USING (auth.uid() = user_id);

-- Exercise logs policies
CREATE POLICY "Users can view own exercise logs" ON exercise_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own exercise logs" ON exercise_logs
  FOR ALL USING (auth.uid() = user_id);

-- Streaks policies
CREATE POLICY "Users can view own streaks" ON streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own streaks" ON streaks
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- Service Role Bypass (for backend operations)
-- The service role key bypasses RLS automatically
-- =============================================

-- Grant service role full access (already default in Supabase)
-- Just documenting that backend uses service_role key

COMMENT ON TABLE profiles IS 'User profiles with nutrition targets';
COMMENT ON TABLE exercise_preferences IS 'User exercise capabilities and time availability';
COMMENT ON TABLE calorie_logs IS 'Daily calorie and macro intake tracking';
COMMENT ON TABLE exercise_logs IS 'Daily exercise activity tracking';
COMMENT ON TABLE streaks IS 'Calorie and exercise streak tracking';
