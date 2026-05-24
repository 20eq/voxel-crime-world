# Supabase Setup Guide (Firebase Alternative)

## Why Supabase?

✅ Open-source (no vendor lock-in)  
✅ Free tier: 500MB database, 1GB file storage  
✅ Auth + Database + Storage  
✅ Real-time subscriptions  
✅ SQL-based (more powerful than Firebase)  
✅ 50,000 monthly active users on free tier  

---

## Step 1: Create Supabase Project

1. Go to: [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub (easiest)
4. Create a new project:
   - **Name:** `voxel-crime-world`
   - **Database Password:** (copy and save this!)
   - **Region:** Choose closest to you
5. Wait for project to be created (~2 mins)

---

## Step 2: Get Your API Keys

1. Go to: **Settings → API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public** key (for client-side)
   - **service_role** key (for server-side only!)

---

## Step 3: Update Your Code

Open `src/supabase/config.js` and replace:
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

With your actual values from Step 2.

---

## Step 4: Set Up Database Tables

Go to **SQL Editor** in Supabase dashboard and run this:

```sql
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

-- Users can only read/write their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);


-- ============================================
-- GAME STATES TABLE (for multiplayer)
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
```

---

## Step 5: Enable Google Auth

1. Go to: **Authentication → Providers → Google**
2. Toggle to **Enabled**
3. Add your Google OAuth credentials:
   - **Client ID:** (from Google Cloud Console)
   - **Client Secret:** (from Google Cloud Console)

### Getting Google OAuth Credentials:

1. Go to: [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to: **APIs & Services → Credentials**
4. Create **OAuth client ID** (Web application)
5. Add authorized redirect URI: `https://[YOUR-PROJECT].supabase.co/auth/v1/callback`
6. Copy Client ID and Secret to Supabase

---

## Step 6: Update Auth URL in Supabase

1. Go to: **Authentication → URL Configuration**
2. Set **Site URL:** `https://20eq.github.io/voxel-crime-world` (your GitHub Pages URL)
3. Set **Redirect URLs:** same as above

---

## Features Now Available:

| Feature | Supabase Equivalent |
|---------|---------------------|
| Firebase Auth | Supabase Auth |
| Firestore DB | PostgreSQL |
| Real-time | Supabase Realtime |
| Storage | Supabase Storage |
| Cloud Functions | Edge Functions (or just API routes) |

---

## Alternatives to Consider:

| Service | Best For | Free Tier |
|---------|----------|-----------|
| **Supabase** ⭐ | Firebase replacement | 500MB DB, 1GB storage |
| **Appwrite** | Similar to Supabase | 5 projects |
| **Parse** | Self-hosted option | Open source |
| **MongoDB Atlas** | Database only | 512MB |
| **Clerk** | Auth only | 10K MAU |

---

## Need Help?

- Docs: [supabase.com/docs](https://supabase.com/docs)
- Discord: supabase.com/discord

Good luck! 🚀