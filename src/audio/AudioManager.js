// ============================================
// PHASE 6: AUDIO MANAGER
// ============================================

export class AudioManager {
  constructor() {
    this.context = null;
    this.sounds = {};
    this.music = null;
    this.volume = {
      master: 1,
      music: 0.5,
      sfx: 0.8
    };
    
    this.init();
  }

  init() {
    // Create audio context on first user interaction
    document.addEventListener('click', () => {
      if (!this.context) {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.loadSounds();
      }
    }, { once: true });
  }

  loadSounds() {
    // Generate sounds procedurally (since we don't have audio files)
    this.sounds = {
      footstep: { freq: 100, duration: 0.1, type: 'noise' },
      jump: { freq: 200, duration: 0.2, type: 'sine' },
      land: { freq: 80, duration: 0.15, type: 'noise' },
      shoot: { freq: 150, duration: 0.1, type: 'noise' },
      hit: { freq: 300, duration: 0.15, type: 'sine' },
      engine: { freq: 80, duration: 0.5, type: 'sawtooth' },
      siren: { freq: 600, duration: 1, type: 'sine' },
      pickup: { freq: 800, duration: 0.2, type: 'sine' },
      purchase: { freq: 1000, duration: 0.3, type: 'sine' },
      alert: { freq: 500, duration: 0.5, type: 'square' }
    };
  }

  play(soundName, volumeMultiplier = 1) {
    if (!this.context || !this.sounds[soundName]) return;
    
    const sound = this.sounds[soundName];
    const vol = this.volume.sfx * this.volume.master * volumeMultiplier;
    
    if (sound.type === 'noise') {
      this.playNoise(sound.duration, vol);
    } else {
      this.playTone(sound.freq, sound.duration, sound.type, vol);
    }
  }

  playTone(frequency, duration, type = 'sine', volume = 0.5) {
    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
    
    gainNode.gain.setValueAtTime(volume, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);
    
    oscillator.start();
    oscillator.stop(this.context.currentTime + duration);
  }

  playNoise(duration, volume = 0.5) {
    const bufferSize = this.context.sampleRate * duration;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const source = this.context.createBufferSource();
    const gainNode = this.context.createGain();
    
    source.buffer = buffer;
    gainNode.gain.setValueAtTime(volume, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
    
    source.connect(gainNode);
    gainNode.connect(this.context.destination);
    
    source.start();
  }

  playMusic() {
    if (!this.context || this.music) return;
    
    // Simple ambient music loop
    const playNote = (freq, startTime, duration) => {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume.music * 0.3, startTime + 0.1);
      gain.gain.linearRampToValueAtTime(0, startTime + duration);
      
      osc.connect(gain);
      gain.connect(this.context.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // Play a simple ambient chord progression
    const now = this.context.currentTime;
    const notes = [220, 277, 330, 440]; // A minor chord
    
    notes.forEach((note, i) => {
      playNote(note, now + i * 0.5, 4);
    });
  }

  setVolume(type, value) {
    if (type in this.volume) {
      this.volume[type] = Math.max(0, Math.min(1, value));
    }
  }

  update(delta) {
    // Ambient sound effects based on game state
  }
}