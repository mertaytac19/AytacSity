/**
 * NEUROSYNAPSE - Game 4: Temporal Paradox (İşlem Hızı & Çift Zaman Çizgisi)
 * High-speed visual scanning & comparison test under rapid temporal pressure.
 */

class TemporalSpeedGame extends BaseGame {
  constructor(engine) {
    super(engine);
    this.glyphs = [
      { char: '⚡', name: 'Yıldırım' },
      { char: '✦', name: 'Yıldız' },
      { char: '⬢', name: 'Poligon' },
      { char: '🧬', name: 'Sarmal' },
      { char: '⚛️', name: 'Atom' },
      { char: '💠', name: 'Kuantum' },
      { char: '⌘', name: 'Komut' },
      { char: '☯', name: 'Denge' }
    ];
    this.currentPast = null;
    this.currentFuture = null;
    this.isMatch = false;
    this.roundStartTime = 0;
    this.roundTimeout = null;
  }

  onStart() {
    this.renderStage();
    this.addKeyListener((e) => {
      if (e.repeat) return;
      if (['ArrowLeft', 'a', 'A', '1'].includes(e.key)) {
        this.handleDecision(true);
      } else if (['ArrowRight', 'd', 'D', '2'].includes(e.key)) {
        this.handleDecision(false);
      }
    });
    this.nextTrial();
  }

  renderStage() {
    this.mount.innerHTML = `
      <div class="temporal-stage">
        <div class="temporal-streams">
          
          <div class="timeline-box past-box" id="box-past">
            <span class="tl-badge">GEÇMİŞ ÇİZGİSİ [T-1]</span>
            <span class="tl-symbol" id="sym-past">⚡</span>
            <span class="tl-label" id="lbl-past" style="color: var(--neon-cyan); font-size: 0.8rem; font-family: var(--font-mono);">Kayıt A</span>
          </div>

          <div class="temporal-vs-divider">
            <div class="t-vs-orb">VS</div>
            <span style="font-size: 0.7rem; font-family: var(--font-mono); color: var(--text-muted);">SENKRON?</span>
          </div>

          <div class="timeline-box future-box" id="box-future">
            <span class="tl-badge">GELECEK ÇİZGİSİ [T+1]</span>
            <span class="tl-symbol" id="sym-future">⚡</span>
            <span class="tl-label" id="lbl-future" style="color: var(--neon-emerald); font-size: 0.8rem; font-family: var(--font-mono);">Kayıt B</span>
          </div>

        </div>

        <div class="temporal-actions">
          <button class="btn-temporal-decision btn-match-true" id="btn-temp-same">
            <span>✔ AYNI (SENKRON)</span>
            <span style="font-size: 0.7rem; opacity: 0.8;">[SOL OK / A / 1]</span>
          </button>
          <button class="btn-temporal-decision btn-match-false" id="btn-temp-diff">
            <span>✖ FARKLI (PARADOKS)</span>
            <span style="font-size: 0.7rem; opacity: 0.8;">[SAĞ OK / D / 2]</span>
          </button>
        </div>
      </div>
    `;

    this.setRule("İki taraftaki semboller ve durumlar birebir AYNI ise 'AYNI', farklıysa 'FARKLI' butonuna ışık hızında basın!");

    const sameBtn = document.getElementById('btn-temp-same');
    const diffBtn = document.getElementById('btn-temp-diff');

    if (sameBtn) sameBtn.addEventListener('click', () => this.handleDecision(true));
    if (diffBtn) diffBtn.addEventListener('click', () => this.handleDecision(false));
  }

  nextTrial() {
    this.clearGameTimeout(this.roundTimeout);

    this.isMatch = Math.random() > 0.5;
    const g1 = this.glyphs[Math.floor(Math.random() * this.glyphs.length)];
    let g2 = g1;

    if (!this.isMatch) {
      const otherGlyphs = this.glyphs.filter(g => g.char !== g1.char);
      g2 = otherGlyphs[Math.floor(Math.random() * otherGlyphs.length)];
    }

    this.currentPast = g1;
    this.currentFuture = g2;

    const symPast = document.getElementById('sym-past');
    const symFuture = document.getElementById('sym-future');
    const lblPast = document.getElementById('lbl-past');
    const lblFuture = document.getElementById('lbl-future');

    if (symPast) {
      symPast.textContent = g1.char;
      symPast.style.transform = 'scale(1.2)';
      setTimeout(() => symPast && (symPast.style.transform = 'scale(1)'), 80);
    }
    if (symFuture) {
      symFuture.textContent = g2.char;
      symFuture.style.transform = 'scale(1.2)';
      setTimeout(() => symFuture && (symFuture.style.transform = 'scale(1)'), 80);
    }

    if (lblPast) lblPast.textContent = g1.name;
    if (lblFuture) lblFuture.textContent = g2.name;

    this.roundStartTime = performance.now();

    // Fast reaction time limit using difficulty manager
    const timeLimit = this.difficulty.getTimeLimit(2000, 800);
    
    this.roundTimeout = this.gameTimeout(() => {
      this.handleTimeout();
    }, timeLimit);
  }

  handleDecision(userSaysMatch) {
    this.clearGameTimeout(this.roundTimeout);
    const reactionTime = Math.round(performance.now() - this.roundStartTime);

    const isCorrect = (userSaysMatch === this.isMatch);

    if (isCorrect) {
      const speedBonus = Math.max(0, Math.round((1300 - reactionTime) / 8));
      const pts = 90 + speedBonus + Math.round(this.engine.combo * 15);
      this.reportSuccess(pts, reactionTime);
    } else {
      this.reportError("Hatalı Karar!");
    }

    if (this.engine.isRunning) {
      this.nextTrial();
    }
  }

  handleTimeout() {
    this.reportError("Zaman Aşımı!");
    if (this.engine.isRunning) {
      this.nextTrial();
    }
  }

  onDestroy() {
    // Timers auto-cleaned
  }
}

window.TemporalSpeedGame = TemporalSpeedGame;

GameRegistry.register('temporalspeed', {
  name: 'Temporal Paradox',
  subtitle: 'Zaman Paradoksu',
  description: 'Eşzamanlı akan geçmiş ve gelecek olay akışlarındaki ortak desenleri yakalayın, zamansal tuzaklara takılmadan saniyenin onda biri sürede onaylayın.',
  fullDescription: 'İki paralel zaman çizgisindeki anomalileri mikro saniyeler içinde senkronize et, parazitleri yoksay.',
  category: 'speed',
  categoryName: 'İşlem Hızı',
  categoryIcon: '⏳',
  categoryLabel: 'İŞLEM HIZI',
  icon: '⏳',
  tagClass: 'tag-emerald',
  orbClass: 'orb-temporal',
  catClass: 'cat-speed',
  tagline: '⏳ Zaman Baskısı',
  difficultyLabel: 'Refleks & Karar',
  cogDimension: 'speed',
  skills: ['Görsel Tarama Hızı', 'Refleksif Doğruluk', 'Zaman Algısı'],
  duration: 45,
  GameClass: TemporalSpeedGame
});
