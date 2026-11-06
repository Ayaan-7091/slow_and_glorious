/**
 * ControlsManager
 * 
 * Handles unified input from both:
 *  1. Desktop Keyboard (WASD, Arrow Keys, Spacebar for drift, Shift for Boost, H for Horn, R for Respawn, M for Mute)
 *  2. Mobile / Touchscreen buttons (Left, Right, Gas, Brake, Drift, Boost, Horn, Mute)
 * 
 * Multi-touch friendly: Allows holding Gas + Boost while steering and tapping Horn or Drift.
 */
export class ControlsManager {
  constructor(audioManager) {
    this.audio = audioManager;

    // Current input states
    this.state = {
      gas: false,
      brake: false,
      left: false,
      right: false,
      drift: false,
      boost: false,
      reset: false,
    };

    // Track active key codes
    this.activeKeys = new Set();

    this.initKeyboard();
    this.initTouchButtons();
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Prevent default browser scrolling and special behaviors
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Shift'].includes(e.key)) {
        e.preventDefault();
      }

      this.activeKeys.add(e.code);

      // Trigger Horn on KeyH
      if (e.code === 'KeyH' && this.audio) {
        this.audio.playHorn();
      }

      // Toggle Mute on KeyM
      if (e.code === 'KeyM' && this.audio) {
        const isMuted = this.audio.toggleMute();
        this.updateMuteUI(isMuted);
      }

      this.updateKeyboardState();
    });

    window.addEventListener('keyup', (e) => {
      this.activeKeys.delete(e.code);
      this.updateKeyboardState();
    });

    window.addEventListener('blur', () => {
      this.activeKeys.clear();
      this.updateKeyboardState();
    });
  }

  updateKeyboardState() {
    this.state.gas = this.activeKeys.has('KeyW') || this.activeKeys.has('ArrowUp');
    this.state.brake = this.activeKeys.has('KeyS') || this.activeKeys.has('ArrowDown');
    this.state.left = this.activeKeys.has('KeyA') || this.activeKeys.has('ArrowLeft');
    this.state.right = this.activeKeys.has('KeyD') || this.activeKeys.has('ArrowRight');
    this.state.drift = this.activeKeys.has('Space');
    this.state.boost = this.activeKeys.has('ShiftLeft') || this.activeKeys.has('ShiftRight');

    if (this.activeKeys.has('KeyR')) {
      this.state.reset = true;
    }
  }

  bindButton(elementId, stateProperty) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const press = (e) => {
      e.preventDefault();
      this.state[stateProperty] = true;
      el.classList.add('active');
    };

    const release = (e) => {
      e.preventDefault();
      this.state[stateProperty] = false;
      el.classList.remove('active');
    };

    el.addEventListener('pointerdown', press);
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
    el.addEventListener('pointerleave', release);
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  initTouchButtons() {
    this.bindButton('btn-left', 'left');
    this.bindButton('btn-right', 'right');
    this.bindButton('btn-gas', 'gas');
    this.bindButton('btn-brake', 'brake');
    this.bindButton('btn-drift', 'drift');
    this.bindButton('btn-boost', 'boost');

    // Horn button
    const hornBtn = document.getElementById('btn-horn');
    if (hornBtn) {
      hornBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        hornBtn.classList.add('active');
        if (this.audio) this.audio.playHorn();
      });
      const endHorn = () => hornBtn.classList.remove('active');
      hornBtn.addEventListener('pointerup', endHorn);
      hornBtn.addEventListener('pointercancel', endHorn);
      hornBtn.addEventListener('pointerleave', endHorn);
    }

    // Mute toggle button
    const muteBtn = document.getElementById('btn-mute');
    if (muteBtn) {
      muteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.audio) {
          const isMuted = this.audio.toggleMute();
          this.updateMuteUI(isMuted);
        }
      });
    }

    // Reset button on HUD
    const resetBtn = document.getElementById('btn-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.state.reset = true;
      });
    }
  }

  updateMuteUI(isMuted) {
    const muteBtn = document.getElementById('btn-mute');
    if (muteBtn) {
      muteBtn.textContent = isMuted ? '🔇 Unmute' : '🔊 Mute';
      muteBtn.classList.toggle('muted', isMuted);
    }
  }

  consumeReset() {
    const r = this.state.reset;
    this.state.reset = false;
    return r;
  }
}
