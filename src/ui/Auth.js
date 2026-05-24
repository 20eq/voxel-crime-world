// ============================================
// AUTH UI - Login/Logout Screen
// ============================================

export class AuthUI {
  constructor(game) {
    this.game = game;
    this.isVisible = false;
    this.createUI();
  }

  createUI() {
    // Auth overlay
    this.overlay = document.createElement('div');
    this.overlay.id = 'auth-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 2000;
    `;

    // Auth container
    const container = document.createElement('div');
    container.style.cssText = `
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      padding: 40px;
      border-radius: 20px;
      text-align: center;
      color: white;
      max-width: 400px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1);
    `;

    container.innerHTML = `
      <h1 style="font-size: 2.5rem; margin-bottom: 10px;">🎮 VoxelCrime World</h1>
      <p style="color: #888; margin-bottom: 30px;">Sign in to save your progress</p>
      
      <button id="google-login" style="
        background: linear-gradient(135deg, #4285f4, #34a853);
        color: white;
        border: none;
        padding: 15px 40px;
        font-size: 16px;
        font-weight: bold;
        border-radius: 10px;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      ">
        🔵 Sign in with Google
      </button>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
        <p style="color: #666; font-size: 12px;">Continue as guest (progress won't be saved)</p>
        <button id="guest-continue" style="
          background: transparent;
          color: #888;
          border: 1px solid #444;
          padding: 10px 30px;
          font-size: 14px;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 10px;
        ">Play as Guest</button>
      </div>
    `;

    this.overlay.appendChild(container);
    document.body.appendChild(this.overlay);

    // Event listeners
    document.getElementById('google-login').addEventListener('click', () => this.signInWithGoogle());
    document.getElementById('guest-continue').addEventListener('click', () => this.continueAsGuest());
  }

  async signInWithGoogle() {
    const btn = document.getElementById('google-login');
    btn.textContent = '⏳ Loading...';
    btn.disabled = true;

    try {
      await this.game.firebaseService.signInWithGoogle();
      this.hide();
      this.game.showNotification('✅ Signed in as ' + this.game.firebaseService.currentUser.displayName);
    } catch (error) {
      btn.textContent = '🔵 Sign in with Google';
      btn.disabled = false;
      this.game.showNotification('❌ Sign in failed: ' + error.message, 'error');
    }
  }

  continueAsGuest() {
    this.hide();
    this.game.showNotification('🎮 Playing as Guest');
  }

  show() {
    this.overlay.style.display = 'flex';
    this.isVisible = true;
  }

  hide() {
    this.overlay.style.display = 'none';
    this.isVisible = false;
  }
}