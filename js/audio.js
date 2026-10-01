/**
 * NEUROSYNAPSE - Procedural Web Audio Sound Engine
 * Synthesizes real-time binaural brainwave frequencies and interactive sci-fi SFX.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.binauralEnabled = false;
    
    // Binaural nodes
    this.binauralGain = null;
    this.oscLeft = null;
    this.oscRight = null;
    this.panLeft = null;
    this.panRight = null;
    
    this.scale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25]; // C Major Pentagon/Ionian
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSFX() {
    this.sfxEnabled = !this.sfxEnabled;
    return this.sfxEnabled;
  }

  toggleBinaural() {
    this.init();
    this.binauralEnabled = !this.binauralEnabled;
    
    if (this.binauralEnabled) {
      this.startBinaural(210, 220); // 10Hz Alpha wave for cognitive focus
    } else {
      this.stopBinaural();
    }
    return this.binauralEnabled;
  }

  startBinaural(baseFreq = 216, targetFreq = 226) {
    if (!this.ctx) return;
    this.stopBinaural();

    try {
      this.binauralGain = this.ctx.createGain();
      this.binauralGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.binauralGain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 3);

      // Left Channel
      this.oscLeft = this.ctx.createOscillator();
      this.panLeft = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      this.oscLeft.type = 'sine';
      this.oscLeft.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      
      if (this.panLeft) {
        this.panLeft.pan.setValueAtTime(-1, this.ctx.currentTime);
        this.oscLeft.connect(this.panLeft);
        this.panLeft.connect(this.binauralGain);
      } else {
        this.oscLeft.connect(this.binauralGain);
      }

      // Right Channel
      this.oscRight = this.ctx.createOscillator();
      this.panRight = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      this.oscRight.type = 'sine';
      this.oscRight.frequency.setValueAtTime(targetFreq, this.ctx.currentTime);
      
      if (this.panRight) {
        this.panRight.pan.setValueAtTime(1, this.ctx.currentTime);
        this.oscRight.connect(this.panRight);
        this.panRight.connect(this.binauralGain);
      } else {
        this.oscRight.connect(this.binauralGain);
      }

      this.binauralGain.connect(this.ctx.destination);
      this.oscLeft.start();
      this.oscRight.start();
    } catch (e) {
      console.warn("Binaural sound error:", e);
    }
  }

  stopBinaural() {
    if (this.binauralGain && this.ctx) {
      try {
        this.binauralGain.gain.setValueAtTime(this.binauralGain.gain.value, this.ctx.currentTime);
        this.binauralGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
        setTimeout(() => {
          if (this.oscLeft) { this.oscLeft.stop(); this.oscLeft.disconnect(); }
          if (this.oscRight) { this.oscRight.stop(); this.oscRight.disconnect(); }
          this.oscLeft = null;
          this.oscRight = null;
        }, 600);
      } catch (e) {}
    }
  }

  playClick() {
    if (!this.sfxEnabled) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04);
      
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {}
  }

  playCorrect(combo = 1) {
    if (!this.sfxEnabled) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const baseIdx = Math.min(Math.floor(combo / 2), this.scale.length - 3);
      const notes = [this.scale[baseIdx], this.scale[baseIdx + 2], this.scale[baseIdx + 4] || this.scale[baseIdx + 2] * 1.5];

      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);
        
        gain.gain.setValueAtTime(0, now + i * 0.05);
        gain.gain.linearRampToValueAtTime(0.15, now + i * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.28);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.3);
      });
    } catch (e) {}
  }

  playError() {
    if (!this.sfxEnabled) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(70, now + 0.2);
      
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }

  playTone(index = 0) {
    if (!this.sfxEnabled) return;
    this.init();
    try {
      const freq = this.scale[index % this.scale.length];
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {}
  }

  playLaser() {
    if (!this.sfxEnabled) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.22);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {}
  }

  playLevelUp() {
    if (!this.sfxEnabled) return;
    this.init();
    try {
      const chord = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
      chord.forEach((freq, idx) => {
        const now = this.ctx.currentTime + idx * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.85);
      });
    } catch (e) {}
  }
}

window.soundEngine = new SoundEngine();
