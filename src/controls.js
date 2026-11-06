/**
 * ControlsManager
 * 
 * Handles unified input from both:
 *  1. Desktop Keyboard (WASD, Arrow Keys, Spacebar for drift, Shift for Boost, H for Horn, R for Respawn, M for Mute)
 *  2. Mobile / Touchscreen buttons (Left, Right, Gas, Brake, Drift, Boost, Horn, Mute, Respawn)
 * 
 * High-responsiveness mobile touch engine:
 *  - Pointer Capture & multi-touch friendly: allows holding Gas + Boost while steering and tapping Horn/Drift.
 *  - Slide-to-steer: smooth thumb dragging between Left and Right buttons without lifting finger.
 *  - Zero-latency: uses passive:false with immediate event dispatch and preventDefault.
 *  - Prevents sticky buttons or accidental releases on capacitive thumb roll.
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
      for (const k in this.state) this.state[k] = false;
      document.querySelectorAll('.touch-btn.active').forEach((b) => b.classList.remove('active'));
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

    // Set of active touch/pointer IDs holding this button
    const activePointers = new Set();

    const press = (id) => {
      activePointers.add(id);
      this.state[stateProperty] = true;
      el.classList.add('active');
    };

    const release = (id) => {
      activePointers.delete(id);
      if (activePointers.size === 0) {
        this.state[stateProperty] = false;
        el.classList.remove('active');
      }
    };

    // 1. Pointer Events with pointer capture
    el.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();
      try {
        el.setPointerCapture(e.pointerId);
      } catch (_) {}
      press(e.pointerId);
    }, { passive: false });

    el.addEventListener('pointerup', (e) => {
      e.preventDefault();
      try {
        if (el.hasPointerCapture(e.pointerId)) {
          el.releasePointerCapture(e.pointerId);
        }
      } catch (_) {}
      release(e.pointerId);
    }, { passive: false });

    el.addEventListener('pointercancel', (e) => {
      e.preventDefault();
      try {
        if (el.hasPointerCapture(e.pointerId)) {
          el.releasePointerCapture(e.pointerId);
        }
      } catch (_) {}
      release(e.pointerId);
    }, { passive: false });

    // 2. Direct Touch Events fallback for instant 0ms touch response
    el.addEventListener('touchstart', (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        press(`t_${e.changedTouches[i].identifier}`);
      }
    }, { passive: false });

    el.addEventListener('touchend', (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        release(`t_${e.changedTouches[i].identifier}`);
      }
    }, { passive: false });

    el.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        release(`t_${e.changedTouches[i].identifier}`);
      }
    }, { passive: false });

    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  initTouchButtons() {
    this.bindButton('btn-left', 'left');
    this.bindButton('btn-right', 'right');
    this.bindButton('btn-gas', 'gas');
    this.bindButton('btn-brake', 'brake');
    this.bindButton('btn-drift', 'drift');
    this.bindButton('btn-boost', 'boost');

    // Smooth Slide-to-Steer across Steering Cluster
    const steerCluster = document.querySelector('.steering-cluster');
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');

    if (steerCluster && btnLeft && btnRight) {
      const handleSteerSlide = (clientX, clientY) => {
        const target = document.elementFromPoint(clientX, clientY);
        if (!target) return;
        const inLeft = target === btnLeft || btnLeft.contains(target);
        const inRight = target === btnRight || btnRight.contains(target);

        if (inLeft && !this.state.left) {
          this.state.left = true;
          this.state.right = false;
          btnLeft.classList.add('active');
          btnRight.classList.remove('active');
        } else if (inRight && !this.state.right) {
          this.state.right = true;
          this.state.left = false;
          btnRight.classList.add('active');
          btnLeft.classList.remove('active');
        }
      };

      steerCluster.addEventListener('pointermove', (e) => {
        if (this.state.left || this.state.right) {
          handleSteerSlide(e.clientX, e.clientY);
        }
      }, { passive: true });

      steerCluster.addEventListener('touchmove', (e) => {
        if (this.state.left || this.state.right) {
          for (let i = 0; i < e.touches.length; i++) {
            handleSteerSlide(e.touches[i].clientX, e.touches[i].clientY);
          }
        }
      }, { passive: true });
    }

    // Horn button with zero-latency touch support
    const hornBtn = document.getElementById('btn-horn');
    if (hornBtn) {
      const activeHorn = new Set();
      const honkPress = (id) => {
        activeHorn.add(id);
        hornBtn.classList.add('active');
        if (this.audio) this.audio.playHorn();
      };
      const honkRelease = (id) => {
        activeHorn.delete(id);
        if (activeHorn.size === 0) {
          hornBtn.classList.remove('active');
        }
      };

      hornBtn.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        e.preventDefault();
        try { hornBtn.setPointerCapture(e.pointerId); } catch (_) {}
        honkPress(e.pointerId);
      }, { passive: false });

      hornBtn.addEventListener('pointerup', (e) => {
        e.preventDefault();
        try { if (hornBtn.hasPointerCapture(e.pointerId)) hornBtn.releasePointerCapture(e.pointerId); } catch (_) {}
        honkRelease(e.pointerId);
      }, { passive: false });

      hornBtn.addEventListener('pointercancel', (e) => {
        e.preventDefault();
        try { if (hornBtn.hasPointerCapture(e.pointerId)) hornBtn.releasePointerCapture(e.pointerId); } catch (_) {}
        honkRelease(e.pointerId);
      }, { passive: false });

      hornBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          honkPress(`t_${e.changedTouches[i].identifier}`);
        }
      }, { passive: false });

      hornBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          honkRelease(`t_${e.changedTouches[i].identifier}`);
        }
      }, { passive: false });

      hornBtn.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          honkRelease(`t_${e.changedTouches[i].identifier}`);
        }
      }, { passive: false });

      hornBtn.addEventListener('contextmenu', (e) => e.preventDefault());
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
      const triggerReset = (e) => {
        e.preventDefault();
        this.state.reset = true;
      };
      resetBtn.addEventListener('click', triggerReset);
      resetBtn.addEventListener('touchend', triggerReset, { passive: false });
    }
  }

  updateMuteUI(isMuted) {
    const muteBtn = document.getElementById('btn-mute');
    if (muteBtn) {
      muteBtn.textContent = isMuted ? '🔇' : '🔊';
      muteBtn.classList.toggle('muted', isMuted);
    }
  }

  consumeReset() {
    const r = this.state.reset;
    this.state.reset = false;
    return r;
  }
}
