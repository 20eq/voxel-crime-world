-- ============================================
-- VOXEL CRIME WORLD - DATABASE SETUP
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  username TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  stats JSONB DEFAULT '{"level":1,"xp":0,"cash":5000,"kills":0,"deaths":0,"missionsCompleted":0,"playTime":0}'::jsonb,
  inventory JSONB DEFAULT '{"weapons":["Fists","Pistol"],"vehicles":["Sedan"],"properties":[]}'::jsonb,
  settings JSONB DEFAULT '{"sensitivity":1.0,"musicVolume":0.7,"sfxVolume":1.0}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);


-- ============================================
-- GAME STATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.game_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  position JSONB DEFAULT '{"x":0,"y":20,"z":0}'::jsonb,
  rotation JSONB DEFAULT '{"x":0,"y":0,"z":0}'::jsonb,
  health INTEGER DEFAULT 100,
  inventory JSONB DEFAULT '[]'::jsonb,
  money INTEGER DEFAULT 5000,
  wanted_level INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.game_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own game state" ON public.game_states
  FOR ALL USING (auth.uid() = user_id);


-- ============================================
-- LEADERBOARD TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  username TEXT NOT NULL,
  type TEXT NOT NULL,
  value INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard
  FOR SELECT USING (true);

CREATE POLICY "Users can update own scores" ON public.leaderboard
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ============================================
-- DONE! Tables created successfully.
-- ============================================