// ============================================
// FIREBASE CONFIGURATION
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getAuth,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Auth Provider (Google)
const googleProvider = new GoogleAuthProvider();

export class FirebaseService {
  constructor() {
    this.currentUser = null;
    this.userData = null;
    this.unsubscribe = null;
  }

  // Listen for auth state changes
  init(callbacks) {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.currentUser = user;
        console.log('✅ Logged in as:', user.displayName);
        await this.loadUserData();
        callbacks.onLogin?.(user, this.userData);
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
      const result = await signInWithPopup(auth, googleProvider);
      console.log('🎉 Sign in successful:', result.user.displayName);
      return result.user;
    } catch (error) {
      console.error('❌ Sign in failed:', error.message);
      throw error;
    }
  }

  // Sign out
  async signOut() {
    try {
      await signOut(auth);
      console.log('👋 Signed out');
    } catch (error) {
      console.error('❌ Sign out failed:', error.message);
    }
  }

  // Load user data from Firestore
  async loadUserData() {
    if (!this.currentUser) return;

    const userRef = doc(db, 'users', this.currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      this.userData = userSnap.data();
    } else {
      // Create new user document
      this.userData = {
        username: this.currentUser.displayName,
        email: this.currentUser.email,
        photoURL: this.currentUser.photoURL,
        createdAt: new Date().toISOString(),
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
      await setDoc(userRef, this.userData);
    }
  }

  // Save user data
  async saveUserData(data) {
    if (!this.currentUser) return;

    const userRef = doc(db, 'users', this.currentUser.uid);
    await updateDoc(userRef, data);
    this.userData = { ...this.userData, ...data };
  }

  // Update player stats
  async updateStats(stats) {
    await this.saveUserData({ stats });
  }

  // Add cash
  async addCash(amount) {
    if (!this.userData) return;
    const newCash = (this.userData.stats.cash || 0) + amount;
    await this.updateStats({ cash: newCash });
    return newCash;
  }

  // Spend cash
  async spendCash(amount) {
    if (!this.userData || this.userData.stats.cash < amount) return false;
    const newCash = this.userData.stats.cash - amount;
    await this.updateStats({ cash: newCash });
    return true;
  }

  // Get leaderboard
  async getLeaderboard(type = 'kills', limitCount = 10) {
    const leaderboardRef = collection(db, 'leaderboard', type, 'scores');
    const q = query(leaderboardRef, orderBy('value', 'desc'), limit(limitCount));
    const snapshot = await new Promise((resolve) => {
      const unsubscribe = onSnapshot(q, (snap) => {
        const data = snap.docs.map(doc => doc.data());
        unsubscribe();
        resolve(data);
      });
    });
    return snapshot;
  }

  // Submit score to leaderboard
  async submitScore(type, value) {
    if (!this.currentUser) return;

    const scoreRef = doc(db, 'leaderboard', type, 'scores', this.currentUser.uid);
    await setDoc(scoreRef, {
      username: this.currentUser.displayName,
      value: value,
      timestamp: new Date().toISOString()
    });
  }

  // Save game state (for multiplayer sync)
  async saveGameState(gameState) {
    if (!this.currentUser) return;
    
    const stateRef = doc(db, 'gameStates', this.currentUser.uid);
    await setDoc(stateRef, {
      ...gameState,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  }

  // Load game state
  async loadGameState() {
    if (!this.currentUser) return null;

    const stateRef = doc(db, 'gameStates', this.currentUser.uid);
    const snap = await getDoc(stateRef);
    return snap.exists() ? snap.data() : null;
  }
}

// Singleton instance
export const firebaseService = new FirebaseService();