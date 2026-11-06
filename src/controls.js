/**
 * ControlsManager
 * 
 * Handles unified input from both:
 *  1. Desktop Keyboard (WASD, Arrow Keys, Spacebar for drift, R for reset)
 *  2. Mobile / Touchscreen on-screen buttons (Left, Right, Gas, Brake, Drift)
 * 
 * Multi-touch friendly: Allows holding Gas while steering and tapping Drift simultaneously.
 */
export class ControlsManager {
  constructor() {
    // Current input states (true if currently pressed)
    this.state = {
      gas: false,
      brake: false,
      left: false,
      right: false,
      drift: false,
      reset: false,
    };

    // Track active key codes
    this.activeKeys = new Set();

    this.initKeyboard();
    this.initTouchButtons();
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Prevent default scrolling for game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      this.activeKeys.add(e.code);
      this.updateKeyboardState();
    });

    window.addEventListener('keyup', (e) => {
      this.activeKeys.delete(e.code);
      this.updateKeyboardState();
    });

    // Reset keys if window loses focus
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

    if (this.activeKeys.has('KeyR')) {
      this.state.reset = true;
    }
  }

  /**
   * Binds pointer (mouse & touch) events to an on-screen button element
   */
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

    // Pointer events handle both touch, mouse, and stylus cleanly
    el.addEventListener('pointerdown', press);
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
    el.addEventListener('pointerleave', release);

    // Context menu prevention on mobile long-press
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  initTouchButtons() {
    this.bindButton('btn-left', 'left');
    this.bindButton('btn-right', 'right');
    this.bindButton('btn-gas', 'gas');
    this.bindButton('btn-brake', 'brake');
    this.bindButton('btn-drift', 'drift');

    // Reset button on HUD
    const resetBtn = document.getElementById('btn-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.state.reset = true;
      });
    }
  }

  /**
   * Returns whether a reset trigger occurred and clears it
   */
  consumeReset() {
    const r = this.state.reset;
    this.state.reset = false;
    return r;
  }
}

