class BaseGame {
  constructor(engine) {
    this.engine = engine;
    this.difficulty = new DifficultyManager();

    this._keyListeners = [];
    this._timeoutIds = [];
    this._intervalIds = [];
    this._rafIds = [];
    this._exitButton = null;
  }

  // Mount'u her seferinde DOM'dan al
  get mount() {
    return document.getElementById('game-mount-point');
  }

  setRule(text) {
    const ruleBar = document.getElementById('game-rule-text');
    if (ruleBar) ruleBar.textContent = text;
  }

  reportSuccess(points = 100, reactionTimeMs = 0) {
    this.engine.onSuccess(points, reactionTimeMs);
    this.difficulty.onCorrect();
  }

  reportError(reason = '') {
    this.engine.onError(reason);
    this.difficulty.onError();
  }

  addKeyListener(handler) {
    window.addEventListener('keydown', handler);
    this._keyListeners.push(handler);
    return handler;
  }

  gameTimeout(fn, ms) {
    const id = window.setTimeout(() => {
      this._timeoutIds = this._timeoutIds.filter(t => t !== id);
      fn();
    }, ms);
    this._timeoutIds.push(id);
    return id;
  }

  clearGameTimeout(id) {
    window.clearTimeout(id);
    this._timeoutIds = this._timeoutIds.filter(t => t !== id);
  }

  gameInterval(fn, ms) {
    const id = window.setInterval(fn, ms);
    this._intervalIds.push(id);
    return id;
  }

  clearGameInterval(id) {
    window.clearInterval(id);
    this._intervalIds = this._intervalIds.filter(t => t !== id);
  }

  gameRAF(fn) {
    const id = window.requestAnimationFrame(fn);
    this._rafIds.push(id);
    return id;
  }

  cancelGameRAF(id) {
    window.cancelAnimationFrame(id);
    this._rafIds = this._rafIds.filter(t => t !== id);
  }

  addExitButton() {
    if (this._exitButton) return;
    const exitBtn = document.createElement('button');
    exitBtn.textContent = '✕ Çıkış';
    exitBtn.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 99999;
      background: rgba(255, 0, 85, 0.9);
      color: white;
      border: 2px solid #ff0055;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      font-size: 1rem;
    `;
    exitBtn.addEventListener('click', () => {
      if (this.engine && this.engine.exitGame) {
        this.engine.exitGame();
      }
    });
    document.body.appendChild(exitBtn);
    this._exitButton = exitBtn;
  }

  start() {
    // MOUNT'U TEMİZLE VE YENİDEN AL
    const mount = this.mount;
    if (mount) {
      mount.innerHTML = '';
    }
    this.addExitButton();
    this.onStart();
  }

  destroy() {
    this._keyListeners.forEach(h => window.removeEventListener('keydown', h));
    this._timeoutIds.forEach(id => window.clearTimeout(id));
    this._intervalIds.forEach(id => window.clearInterval(id));
    this._rafIds.forEach(id => window.cancelAnimationFrame(id));

    this._keyListeners = [];
    this._timeoutIds = [];
    this._intervalIds = [];
    this._rafIds = [];

    if (this._exitButton) {
      this._exitButton.remove();
      this._exitButton = null;
    }

    // MOUNT'U TEMİZLE
    const mount = this.mount;
    if (mount) {
      mount.innerHTML = '';
    }

    this.onDestroy();
  }

  onStart() {}
  onDestroy() {}
}

window.BaseGame = BaseGame;