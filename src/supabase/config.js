// ============================================
// SUPABASE CONFIGURATION (Firebase Alternative)
// ============================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class SupabaseService {
  constructor() {
    this.currentUser = null;
    this.userData = null;
  }

  // Initialize and listen for auth state
  init(callbacks) {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        this.currentUser = session.user;
        console.log('✅ Logged in as:', session.user.email);
        await this.loadUserData();
        callbacks.onLogin?.(session.user, this.userData);
      } else {
        this.currentUser = null;
        this.userData = null;
        callbacks.onLogout?.();
      }
    });
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Sign in failed:', error.message);
      throw error;
    }
  }

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('👋 Signed out');
    } catch (error) {
      console.error('❌ Sign out failed:', error.message);
    }
  }

  // Load user data from database
  async loadUserData() {
    if (!this.currentUser) return;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', this.currentUser.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // User doesn't exist, create new
      this.userData = {
        id: this.currentUser.id,
        username: this.currentUser.user_metadata?.full_name || this.currentUser.email,
        email: this.currentUser.email,
        avatar_url: this.currentUser.user_metadata?.avatar_url,
        created_at: new Date().toISOString(),
        stats: {
          level: 1,
          xp: 0,
          cash: 5000,
          kills: 0,
          deaths: 0,
          missionsCompleted: 0,
          playTime: 0
        },
        inventory: {
          weapons: ['Fists', 'Pistol'],
          vehicles: ['Sedan'],
          properties: []
        },
        settings: {
          sensitivity: 1.0,
          musicVolume: 0.7,
          sfxVolume: 1.0
        }
      };
      
      await this.saveUserData(this.userData);
    } else if (!error) {
      this.userData = data;
    }
  }

  // Save user data
  async saveUserData(data) {
    if (!this.currentUser) return;

    const { error } = await supabase
      .from('users')
      .upsert({ ...data, id: this.currentUser.id });

    if (error) {
      console.error('❌ Save failed:', error.message);
    } else {
      this.userData = data;
    }
  }

  // Update player stats
  async updateStats(stats) {
    if (!this.userData) return;
    const newStats = { ...this.userData.stats, ...stats };
    await this.saveUserData({ stats: newStats });
  }

  // Add cash
  async addCash(amount) {
    if (!this.userData) return 0;
    const newCash = (this.userData.stats.cash || 0) + amount;
    await this.updateStats({ cash: newCash });
    return newCash;
  }

  // Spend cash
  async spendCash(amount) {
    if (!this.userData || this.userData.stats.cash < amount) return false;
    await this.updateStats({ cash: this.userData.stats.cash - amount });
    return true;
  }

  // Get leaderboard
  async getLeaderboard(type = 'kills', limitCount = 10) {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('type', type)
      .order('value', { ascending: false })
      .limit(limitCount);

    if (error) {
      console.error('❌ Leaderboard error:', error.message);
      return [];
    }
    return data || [];
  }

  // Submit score to leaderboard
  async submitScore(type, value) {
    if (!this.currentUser) return;

    await supabase.from('leaderboard').upsert({
      user_id: this.currentUser.id,
      username: this.currentUser.user_metadata?.full_name || 'Unknown',
      type: type,
      value: value,
      created_at: new Date().toISOString()
    });
  }

  // Save game state (for multiplayer sync)
  async saveGameState(gameState) {
    if (!this.currentUser) return;

    await supabase.from('game_states').upsert({
      user_id: this.currentUser.id,
      ...gameState,
      updated_at: new Date().toISOString()
    });
  }

  // Load game state
  async loadGameState() {
    if (!this.currentUser) return null;

    const { data } = await supabase
      .from('game_states')
      .select('*')
      .eq('user_id', this.currentUser.id)
      .single();

    return data;
  }
}

// Singleton instance
export const supabaseService = new SupabaseService();