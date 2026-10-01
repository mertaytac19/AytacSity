/**
 * NEUROSYNAPSE - Game: Speed Match (Hızlı Şekil Karşılaştırma)
 * Tests processing speed and 1-back memory by rapidly showing shapes and 
 * asking if the current shape matches the one immediately before it.
 */

class SpeedMatchGame extends BaseGame {
  constructor(engine) {
    super(engine);
    this.symbols = [
      { char: '★', name: 'Yıldız' },
      { char: '⬤', name: 'Daire' },
      { char: '■', name: 'Kare' },
      { char: '▲', name: 'Üçgen' },
      { char: '✦', name: 'Kıvılcım' },
      { char: '⬢', name: 'Altıgen' }
    ];
    this.previousSymbol = null;
    this.currentSymbol = null;
    this.roundStartTime = 0;
    this.roundTimer = null;
    this.isFirst = true; // First symbol has nothing to compare against
  }

  onStart() {
    this.renderStage();
    this.addKeyListener((e) => {
      if (this.isFirst) return; // Ignore input on the very first shape
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) this.submitAnswer(true);
      else if (['ArrowRight', 'd', 'D'].includes(e.key)) this.submitAnswer(false);
    });
    this.nextRound();
  }

  renderStage() {
    this.mount.innerHTML = \`
      <div class="speed-match-stage" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        
        <div id="sm-card" style="width: 200px; height: 200px; background: rgba(255,255,255,0.05); border: 2px solid var(--neon-emerald); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 30px rgba(0, 255, 157, 0.15); transition: transform 0.1s ease, border-color 0.2s, box-shadow 0.2s;">
          <span id="sm-symbol" style="font-size: 5rem; color: #fff; filter: drop-shadow(0 0 10px rgba(255,255,255,0.3));"></span>
        </div>

        <div id="sm-first-msg" style="margin-top: 20px; font-family: var(--font-mono); color: var(--neon-amber); height: 20px;">
          İlk sembolü hafızana al...
        </div>

        <div class="sm-controls" style="display: flex; gap: 20px; margin-top: 40px; width: 100%; max-width: 400px;">
          <button class="sm-btn btn-match-true" id="btn-sm-same" style="flex: 1; padding: 15px; border-radius: var(--radius-md); font-weight: bold; background: rgba(0, 255, 157, 0.1); border: 1px solid var(--neon-emerald); color: var(--neon-emerald); cursor: pointer; transition: all 0.2s ease;">
            ⬅️ AYNI (A)
          </button>
          <button class="sm-btn btn-match-false" id="btn-sm-diff" style="flex: 1; padding: 15px; border-radius: var(--radius-md); font-weight: bold; background: rgba(255, 0, 85, 0.1); border: 1px solid var(--neon-rose); color: var(--neon-rose); cursor: pointer; transition: all 0.2s ease;">
            FARKLI (D) ➡️
          </button>
        </div>

      </div>
    \`;
    this.setRule("Ekranda beliren şekil, BİR ÖNCEKİ şekil ile AYNI mı?");

    const sameBtn = document.getElementById('btn-sm-same');
    const diffBtn = document.getElementById('btn-sm-diff');

    if (sameBtn) sameBtn.addEventListener('click', () => { if (!this.isFirst) this.submitAnswer(true); });
    if (diffBtn) diffBtn.addEventListener('click', () => { if (!this.isFirst) this.submitAnswer(false); });
  }

  nextRound() {
    this.clearGameTimeout(this.roundTimer);

    const level = this.difficulty.getLevel();
    
    // ~40% chance to be the same
    const isSame = Math.random() < 0.4;
    
    if (this.isFirst) {
      this.currentSymbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
    } else {
      this.previousSymbol = this.currentSymbol;
      if (isSame) {
        this.currentSymbol = this.previousSymbol;
      } else {
        let nextSym = this.currentSymbol;
        while (nextSym.char === this.currentSymbol.char) {
          nextSym = this.symbols[Math.floor(Math.random() * this.symbols.length)];
        }
        this.currentSymbol = nextSym;
      }
    }

    this.renderSymbol();

    if (this.isFirst) {
      // Shorter timeout for the very first item since no action is required
      this.isFirst = false;
      this.roundTimer = this.gameTimeout(() => {
        const msg = document.getElementById('sm-first-msg');
        if (msg) msg.style.opacity = '0';
        this.nextRound();
      }, 1500);
    } else {
      this.roundStartTime = performance.now();
      // Time limit gets very tight at high levels
      const timeLimit = this.difficulty.getTimeLimit(2500, 800);
      this.roundTimer = this.gameTimeout(() => {
        this.handleTimeout();
      }, timeLimit);
    }
  }

  renderSymbol() {
    const card = document.getElementById('sm-card');
    const symEl = document.getElementById('sm-symbol');
    
    if (!card || !symEl) return;

    // Brief vanish to emphasize a new symbol appeared (even if it's the same shape)
    symEl.style.opacity = '0';
    card.style.transform = 'scale(0.95)';
    
    // Randomize slight rotation or color at higher difficulties?
    // Let's keep it simple for raw speed processing.
    
    requestAnimationFrame(() => {
      setTimeout(() => {
        symEl.textContent = this.currentSymbol.char;
        symEl.style.opacity = '1';
        card.style.transform = 'scale(1)';
        if (window.soundEngine) window.soundEngine.playTone(4);
      }, 50);
    });
  }

  submitAnswer(userSaysSame) {
    this.clearGameTimeout(this.roundTimer);
    const reactionTime = Math.round(performance.now() - this.roundStartTime);

    const isMatch = (this.currentSymbol.char === this.previousSymbol.char);
    const isCorrect = (userSaysSame === isMatch);

    if (isCorrect) {
      const speedBonus = Math.max(0, Math.round((1200 - reactionTime) / 10));
      const pts = 80 + speedBonus + Math.round(this.difficulty.getLevel() * 12);
      this.reportSuccess(pts, reactionTime);
    } else {
      this.reportError("Hatalı Karar!");
    }

    if (this.engine.isRunning) {
      this.nextRound();
    }
  }

  handleTimeout() {
    this.reportError("Çok Yavaş!");
    if (this.engine.isRunning) {
      this.nextRound();
    }
  }

  onDestroy() {
    // Timers cleaned up by BaseGame
  }
}

window.SpeedMatchGame = SpeedMatchGame;

GameRegistry.register('speedmatch', {
  name: 'Speed Match',
  subtitle: 'Hızlı Şekil Karşılaştırma',
  description: 'Ekranda beliren şeklin bir öncekiyle aynı olup olmadığına ışık hızında karar ver.',
  fullDescription: 'Bilgi işleme hızınızı ve anlık tepki sürenizi test eden klasik 1-back görevi. Ne kadar hızlı ve doğru karar verirseniz süre limiti o kadar daralır.',
  category: 'speed',
  categoryName: 'İşlem Hızı',
  categoryIcon: '⏱️',
  categoryLabel: 'HIZ & REFLEKS',
  icon: '⚡',
  tagClass: 'tag-emerald', // Using existing tag
  orbClass: 'orb-temporal', // Using existing orb
  catClass: 'cat-speed', // Reusing styling
  tagline: '⏳ Zaman Baskısı',
  difficultyLabel: 'Dinamik Uyarlamalı',
  cogDimension: 'speed',
  skills: ['Bilgi İşleme Hızı', 'Görsel Karşılaştırma', 'Refleks'],
  duration: 45,
  GameClass: SpeedMatchGame
});
