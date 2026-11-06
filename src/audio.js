/**
 * ============================================================================
 * SYNTHESIZED ARCADE AUDIO SYSTEM (Web Audio API)
 * ============================================================================
 * 
 * Generates all retro arcade sound effects in real-time using mathematical
 * oscillators and noise nodes. Zero external MP3/WAV files required!
 * 
 * Features:
 *  - 2-Stroke Rickshaw Engine Hum (sawtooth + lowpass filter pitch-shifting with speed)
 *  - Iconic Indian Auto Double-Beep Horn ("PEEP-PEEP!" dual-tone synthesized horn)
 *  - Checkpoint & Lap Chimes (sparkling musical arpeggio)
 *  - Nitro Boost Roar (filtered white noise + sub-bass punch)
 *  - Collision Impacts (plastic thuds for cones, metallic clangs for barriers)
 *  - Global Mute toggle
 */

export class AudioManager {
  constructor() {
    this.ctx = null; // AudioContext initialized on first user interaction
    this.isMuted = false;

    // Engine sound nodes
    this.engineOsc = null;
    this.engineGain = null;
    this.engineFilter = null;
    this.isEngineRunning = false;

    // Boost sound nodes
    this.boostNoiseGain = null;
    this.isBoosting = false;

    // Listen for any initial user interaction to start AudioContext
    const unlockAudio = () => {
      this.init();
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
  }

  /**
   * Initializes AudioContext upon user gesture
   */
  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.setupEngineSound();
    } catch (e) {
      console.warn('Web Audio API not supported in this browser.', e);
    }
  }

  /**
   * Continuous 2-stroke engine hum that pitches up with speed
   */
  setupEngineSound() {
    if (!this.ctx) return;

    // Master oscillator: Sawtooth wave mimics the buzzy 2-stroke combustion engine
    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.setValueAtTime(38, this.ctx.currentTime); // Idle ~38Hz

    // Lowpass filter to muffle harsh harmonics
    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.setValueAtTime(260, this.ctx.currentTime);

    // Gain node for engine volume
    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    this.engineOsc.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.ctx.destination);

    this.engineOsc.start();
    this.isEngineRunning = true;
  }

  /**
   * Updates engine pitch and volume based on vehicle speed & throttle
   * @param {number} speed - current linear speed
   * @param {number} maxSpeed - maximum speed
   * @param {boolean} isThrottle - whether Gas is pressed
   */
  updateEngine(speed, maxSpeed, isThrottle) {
    if (!this.ctx || !this.isEngineRunning || this.isMuted) {
      if (this.engineGain) this.engineGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
      return;
    }

    // Ensure audio context is running
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const ratio = Math.min(Math.abs(speed) / maxSpeed, 1.0);
    const now = this.ctx.currentTime;

    // Pitch: from 40Hz (idle) to 180Hz (top speed)
    const baseFreq = 42 + ratio * 130 + (isThrottle ? 15 : 0);
    this.engineOsc.frequency.setTargetAtTime(baseFreq, now, 0.08);

    // Cutoff filter opens up with higher throttle
    const cutoff = 240 + ratio * 480 + (isThrottle ? 120 : 0);
    this.engineFilter.frequency.setTargetAtTime(cutoff, now, 0.08);

    // Engine volume: gentle idle hum, louder on throttle
    const targetVolume = isThrottle ? 0.12 : 0.06;
    this.engineGain.gain.setTargetAtTime(targetVolume, now, 0.1);
  }

  /**
   * Iconic Indian Auto-Rickshaw Double-Beep Horn ("PEEP-PEEP!")
   * Uses two synchronized oscillators (440Hz + 554Hz, a musical Major 3rd)
   */
  playHorn() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    
    // Play two rapid beeps
    this.beepSingle(now, 0.11);
    this.beepSingle(now + 0.16, 0.16);
  }

  beepSingle(startTime, duration) {
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Dual-tone harmonic horn frequencies
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(440, startTime); // A4
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(554, startTime); // C#5

    // Envelope: quick attack, steady sustain, fast release
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.22, startTime + 0.02);
    gain.gain.setValueAtTime(0.22, startTime + duration - 0.02);
    gain.gain.linearRampToValueAtTime(0.001, startTime + duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration + 0.05);
    osc2.stop(startTime + duration + 0.05);
  }

  /**
   * Sparkling high-tech chime when passing a checkpoint
   */
  playCheckpointChime() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.001, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.3);
    });
  }

  /**
   * Triumphant fanfare arpeggio on Lap completion
   */
  playLapSound() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.7]; // A major triumphant flourish

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.24, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.5);
    });
  }

  /**
   * Plastic / hollow "thump" when bumping a traffic cone
   */
  playConeHitSound() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    // Rapid pitch drop simulates hollow hollow plastic impact
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  /**
   * Metallic scrape / barrier impact sound
   */
  playBarrierHitSound() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  /**
   * Nitro Boost ignition roar
   */
  playBoostIgnition() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    // Ascending whoosh
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(460, now + 0.25);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.38);
  }

  /**
   * Toggle audio mute
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.engineGain) {
      this.engineGain.gain.setValueAtTime(
        this.isMuted ? 0 : 0.08,
        this.ctx?.currentTime || 0
      );
    }
    return this.isMuted;
  }
}

