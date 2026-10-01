/**
 * NEUROSYNAPSE - Base Game Class
 * All games extend this class to inherit common lifecycle, 
 * difficulty management, resource tracking, and utility methods.
 */

class BaseGame {
  constructor(engine) {
    this.engine = engine;
    this.mount = document.getElementById('game-mount-point');
    this.ruleBar = document.getElementById('game-rule-text');
    this.difficulty = new DifficultyManager();

    // Auto-cleanup tracking arrays
    this._keyListeners = [];
    this._timeoutIds = [];
    this._intervalIds = [];
    this._rafIds = [];
  }

  /* =========================================================
     RULE BAR HELPER
     ========================================================= */

  /** Update the in-game rule instruction bar */
  setRule(text) {
    if (this.ruleBar) this.ruleBar.textContent = text;
  }

  /* =========================================================
     SUCCESS / ERROR REPORTING (with difficulty integration)
     ========================================================= */

  /**
   * Report a correct answer. Updates engine score AND difficulty.
   * @param {number} points - Score points to award
   * @param {number} [reactionTimeMs=0] - Reaction time in ms
   */
  reportSuccess(points = 100, reactionTimeMs = 0) {
    this.engine.onSuccess(points, reactionTimeMs);
    this.difficulty.onCorrect();
  }

  /**
   * Report an incorrect answer. Updates engine state AND difficulty.
   * @param {string} [reason=''] - Description of the error
   */
  reportError(reason = '') {
    this.engine.onError(reason);
    this.difficulty.onError();
  }

  /* =========================================================
     MANAGED RESOURCE HELPERS (auto-cleanup on destroy)
     ========================================================= */

  /**
   * Add a keyboard listener that will be auto-removed on destroy.
   * @param {Function} handler - Keydown event handler
   * @returns {Function} The handler reference
   */
  addKeyListener(handler) {
    window.addEventListener('keydown', handler);
    this._keyListeners.push(handler);
    return handler;
  }

  /**
   * Managed setTimeout - auto-cleared on destroy.
   * @param {Function} fn - Callback
   * @param {number} ms - Delay in milliseconds
   * @returns {number} Timeout ID
   */
  gameTimeout(fn, ms) {
    const id = window.setTimeout(() => {
      this._timeoutIds = this._timeoutIds.filter(t => t !== id);
      fn();
    }, ms);
    this._timeoutIds.push(id);
    return id;
  }

  /**
   * Clear a managed timeout.
   * @param {number} id - Timeout ID from gameTimeout
   */
  clearGameTimeout(id) {
    window.clearTimeout(id);
    this._timeoutIds = this._timeoutIds.filter(t => t !== id);
  }

  /**
   * Managed setInterval - auto-cleared on destroy.
   * @param {Function} fn - Callback
   * @param {number} ms - Interval in milliseconds
   * @returns {number} Interval ID
   */
  gameInterval(fn, ms) {
    const id = window.setInterval(fn, ms);
    this._intervalIds.push(id);
    return id;
  }

  /**
   * Clear a managed interval.
   * @param {number} id - Interval ID from gameInterval
   */
  clearGameInterval(id) {
    window.clearInterval(id);
    this._intervalIds = this._intervalIds.filter(t => t !== id);
  }

  /**
   * Managed requestAnimationFrame - auto-cancelled on destroy.
   * @param {Function} fn - Frame callback
   * @returns {number} RAF ID
   */
  gameRAF(fn) {
    const id = window.requestAnimationFrame(fn);
    this._rafIds.push(id);
    return id;
  }

  /**
   * Cancel a managed RAF.
   * @param {number} id - RAF ID from gameRAF
   */
  cancelGameRAF(id) {
    window.cancelAnimationFrame(id);
    this._rafIds = this._rafIds.filter(t => t !== id);
  }

  /* =========================================================
     LIFECYCLE MANAGEMENT
     ========================================================= */

  /**
   * Called by the engine to start the game.
   * Delegates to onStart() which subclasses override.
   */
  start() {
    this.onStart();
  }

  /**
   * Called by the engine to destroy the game.
   * Auto-cleans all managed resources, then delegates to onDestroy().
   */
  destroy() {
    // Auto-cleanup all managed resources
    this._keyListeners.forEach(h => window.removeEventListener('keydown', h));
    this._timeoutIds.forEach(id => window.clearTimeout(id));
    this._intervalIds.forEach(id => window.clearInterval(id));
    this._rafIds.forEach(id => window.cancelAnimationFrame(id));

    this._keyListeners = [];
    this._timeoutIds = [];
    this._intervalIds = [];
    this._rafIds = [];

    // Subclass-specific cleanup
    this.onDestroy();
  }

  /* =========================================================
     OVERRIDE THESE IN SUBCLASSES
     ========================================================= */

  /** Initialize game UI and start the game loop */
  onStart() {}

  /** Game-specific cleanup (most cleanup is automatic) */
  onDestroy() {}
}

window.BaseGame = BaseGame;
