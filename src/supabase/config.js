// ============================================
// SUPABASE CONFIGURATION
// ============================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://yipayjmuhghigkvhcrwa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpcGF5am11aGdoaWdrdmhjcndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MDEzMDYsImV4cCI6MjA2NDQ3NzMwNn0.apdvcugnhswijvmfmvzh';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class SupabaseService {
  constructor() {
    this.currentUser = null;
    this.userData = null;
  }

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

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('❌ Sign out failed:', error.message);
  }

  async loadUserData() {
    if (!this.currentUser) return;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', this.currentUser.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // Create new user
      const { error: insertError } = await supabase.from('users').insert({
        id: this.currentUser.id,
        username: this.currentUser.user_metadata?.full_name || this.currentUser.email,
        email: this.currentUser.email,
        avatar_url: this.currentUser.user_metadata?.avatar_url,
        stats: { level: 1, xp: 0, cash: 5000, kills: 0, deaths: 0, missionsCompleted: 0, playTime: 0 }
      });
      if (!insertError) {
        this.userData = {
          id: this.currentUser.id,
          stats: { level: 1, xp: 0, cash: 5000, kills: 0, deaths: 0, missionsCompleted: 0, playTime: 0 }
        };
      }
    } else if (!error) {
      this.userData = data;
    }
  }

  async saveUserData(data) {
    if (!this.currentUser) return;
    const { error } = await supabase
      .from('users')
      .upsert({ ...data, id: this.currentUser.id });
    if (!error) this.userData = data;
  }

  async updateStats(stats) {
    if (!this.userData) return;
    const newStats = { ...this.userData.stats, ...stats };
    await this.saveUserData({ stats: newStats });
  }

  async addCash(amount) {
    if (!this.userData) return 0;
    const newCash = (this.userData.stats?.cash || 0) + amount;
    await this.updateStats({ cash: newCash });
    return newCash;
  }

  async saveGameState(state) {
    if (!this.currentUser) return;
    await supabase.from('game_states').upsert({
      user_id: this.currentUser.id,
      ...state,
      updated_at: new Date().toISOString()
    });
  }

  async loadGameState() {
    if (!this.currentUser) return null;
    const { data } = await supabase
      .from('game_states')
      .select('*')
      .eq('user_id', this.currentUser.id)
      .single();
    return data;
  }

  async getLeaderboard(type = 'kills', limitCount = 10) {
    const { data } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('type', type)
      .order('value', { ascending: false })
      .limit(limitCount);
    return data || [];
  }

  async submitScore(type, value) {
    if (!this.currentUser) return;
    await supabase.from('leaderboard').upsert({
      user_id: this.currentUser.id,
      username: this.userData?.username || 'Player',
      type: type,
      value: value,
      created_at: new Date().toISOString()
    }, { onConflict: 'user_id,type' });
  }
}

export const supabaseService = new SupabaseService();