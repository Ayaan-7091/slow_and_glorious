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
    this.engineDuckingFactor = 1.0;

    // Boost sound nodes
    this.boostNoiseGain = null;
    this.isBoosting = false;

    // Upbeat Desi Arcade BGM Sequencer (Sprint 10)
    this.isBgmMuted = false;
    this.bgmGain = null;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.isBgmPlaying = false;

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

    // Engine volume: gentle idle hum, louder on throttle (with ducking support for voice banter)
    const targetVolume = (isThrottle ? 0.12 : 0.06) * this.engineDuckingFactor;
    this.engineGain.gain.setTargetAtTime(targetVolume, now, 0.1);
  }

  setEngineDucking(factor = 1.0) {
    this.engineDuckingFactor = Math.max(0.0, Math.min(1.0, factor));
    if (this.engineGain && this.ctx) {
      this.engineGain.gain.setTargetAtTime(this.engineGain.gain.value * this.engineDuckingFactor, this.ctx.currentTime, 0.05);
    }
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
   * Countdown beeps for 3, 2, 1, CHALO!
   */
  playCountdownBeep(isGo = false) {
    this.init();
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (isGo) {
      // High triumphant "GO!" chord (880Hz / A5)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.35); // Arrive at C6
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.45);
    } else {
      // Warning beep (440Hz / A4)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.22);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);
  }

  /**
   * Soft metallic/rubber thud when two rickshaws bump
   */
  playBumperThud() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  /**
   * Soft, comical cow moo sound synthesized via modulated dual oscillators & formant bandpass filter
   */
  playCowMoo() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const dur = 1.35;

    // Dual oscillators (Sawtooth for nasal buzz + Triangle for body)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'triangle';

    // Pitch envelope: starts ~240Hz, swells to ~290Hz, slides down to ~175Hz ("M-oooo-ooh")
    osc1.frequency.setValueAtTime(240, now);
    osc1.frequency.exponentialRampToValueAtTime(290, now + 0.35);
    osc1.frequency.exponentialRampToValueAtTime(175, now + dur);

    osc2.frequency.setValueAtTime(120, now);
    osc2.frequency.exponentialRampToValueAtTime(145, now + 0.35);
    osc2.frequency.exponentialRampToValueAtTime(88, now + dur);

    // Formant vocal filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 3.2;
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(580, now + 0.35);
    filter.frequency.exponentialRampToValueAtTime(320, now + dur);

    // Amplitude envelope
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.32, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + dur + 0.05);
    osc2.stop(now + dur + 0.05);
  }

  // --------------------------------------------------------------------------
  // UPBEAT DESI ARCADE BGM TRACK (Bhangra / Bollywood 130 BPM Chiptune Groove)
  // --------------------------------------------------------------------------
  setupBgm() {
    if (!this.ctx || this.bgmGain) return;
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(this.isBgmMuted || this.isMuted ? 0 : 0.28, this.ctx.currentTime);
    this.bgmGain.connect(this.ctx.destination);
  }

  startBgm() {
    this.init();
    if (!this.ctx || this.isBgmPlaying) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.setupBgm();

    this.isBgmPlaying = true;
    this.bgmStep = 0;

    // 130 BPM -> 16th note step = ~0.115s
    const stepTimeMs = (60 / 130 / 4) * 1000;

    // Upbeat Indian Pentatonic / Bilawal Lead Melody Notes (Frequencies in Hz)
    // C4, D4, E4, G4, A4, C5, D5
    const N = {
      REST: 0,
      C3: 130.81, D3: 146.83, E3: 164.81, G3: 196.00, A3: 220.00,
      C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.00, A4: 440.00,
      C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99,
    };

    // 32-Step Energetic Desi Arcade Melody
    const leadPattern = [
      N.C5, N.REST, N.C5, N.D5, N.C5, N.A4, N.G4, N.A4,
      N.C5, N.C5,   N.D5, N.E5, N.D5, N.REST, N.C5, N.REST,
      N.E5, N.REST, N.E5, N.D5, N.C5, N.A4, N.G4, N.A4,
      N.G4, N.A4,   N.C5, N.D5, N.C5, N.REST, N.REST, N.REST,
    ];

    // Rolling bass pattern
    const bassPattern = [
      N.C3, N.REST, N.C3, N.G3, N.C3, N.REST, N.G3, N.C3,
      N.A3, N.REST, N.A3, N.E3, N.A3, N.REST, N.E3, N.A3,
      N.F3 || N.C3, N.REST, N.C3, N.G3, N.C3, N.REST, N.G3, N.C3,
      N.G3, N.REST, N.G3, N.D3, N.G3, N.REST, N.D3, N.G3,
    ];

    // Dholak / Tabla syncopated rhythm:
    // Dhol Bass beat on steps: 0, 3, 6, 8, 11, 14, 16, 19, 22, 24, 27, 30
    // Rim Tap on steps: 2, 4, 7, 10, 12, 15, 18, 20, 23, 26, 28, 31
    const dholSteps = [0, 3, 6, 8, 11, 14, 16, 19, 22, 24, 27, 30];
    const tapSteps = [2, 4, 7, 10, 12, 15, 18, 20, 23, 26, 28, 31];

    this.bgmTimer = setInterval(() => {
      if (!this.ctx || !this.isBgmPlaying) return;
      if (this.isBgmMuted || this.isMuted) {
        this.bgmStep = (this.bgmStep + 1) % 32;
        return;
      }

      const now = this.ctx.currentTime;
      const step = this.bgmStep;

      // 1. Dhol Bass Kick
      if (dholSteps.includes(step)) {
        const dholOsc = this.ctx.createOscillator();
        const dholGain = this.ctx.createGain();
        dholOsc.type = 'sine';
        dholOsc.frequency.setValueAtTime(115, now);
        dholOsc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

        dholGain.gain.setValueAtTime(0.26, now);
        dholGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        dholOsc.connect(dholGain);
        dholGain.connect(this.bgmGain);
        dholOsc.start(now);
        dholOsc.stop(now + 0.11);
      }

      // 2. Tabla / Rim Tap Click
      if (tapSteps.includes(step)) {
        const tapOsc = this.ctx.createOscillator();
        const tapGain = this.ctx.createGain();
        tapOsc.type = 'triangle';
        tapOsc.frequency.setValueAtTime(1400, now);
        tapOsc.frequency.exponentialRampToValueAtTime(350, now + 0.035);

        tapGain.gain.setValueAtTime(0.14, now);
        tapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        tapOsc.connect(tapGain);
        tapGain.connect(this.bgmGain);
        tapOsc.start(now);
        tapOsc.stop(now + 0.045);
      }

      // 3. Rolling Bass Synth
      const bassNote = bassPattern[step];
      if (bassNote && bassNote > 0) {
        const bOsc = this.ctx.createOscillator();
        const bFilter = this.ctx.createBiquadFilter();
        const bGain = this.ctx.createGain();

        bOsc.type = 'sawtooth';
        bOsc.frequency.setValueAtTime(bassNote, now);

        bFilter.type = 'lowpass';
        bFilter.frequency.setValueAtTime(320, now);

        bGain.gain.setValueAtTime(0.18, now);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        bOsc.connect(bFilter);
        bFilter.connect(bGain);
        bGain.connect(this.bgmGain);
        bOsc.start(now);
        bOsc.stop(now + 0.095);
      }

      // 4. Chiptune Lead Synth Melody
      const leadNote = leadPattern[step];
      if (leadNote && leadNote > 0) {
        const lOsc = this.ctx.createOscillator();
        const lFilter = this.ctx.createBiquadFilter();
        const lGain = this.ctx.createGain();

        lOsc.type = 'triangle';
        lOsc.frequency.setValueAtTime(leadNote, now);

        lFilter.type = 'lowpass';
        lFilter.frequency.setValueAtTime(1800, now);

        lGain.gain.setValueAtTime(0.16, now);
        lGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        lOsc.connect(lFilter);
        lFilter.connect(lGain);
        lGain.connect(this.bgmGain);
        lOsc.start(now);
        lOsc.stop(now + 0.125);
      }

      this.bgmStep = (this.bgmStep + 1) % 32;
    }, stepTimeMs);
  }

  stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  toggleBgm() {
    this.isBgmMuted = !this.isBgmMuted;
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(
        this.isBgmMuted || this.isMuted ? 0 : 0.28,
        this.ctx.currentTime
      );
    }
    if (!this.isBgmMuted && !this.isBgmPlaying) {
      this.startBgm();
    }
    return !this.isBgmMuted;
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
    if (this.bgmGain) {
      this.bgmGain.gain.setValueAtTime(
        this.isMuted || this.isBgmMuted ? 0 : 0.28,
        this.ctx?.currentTime || 0
      );
    }
    return this.isMuted;
  }
}

