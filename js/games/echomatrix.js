/**
 * NEUROSYNAPSE - Game 3: Echo Resonance (Kuantum N-Back Çalışma Belleği)
 * Multimodal dual n-back: Tests auditory tone memory & spatial visual grid recall simultaneously.
 */

class EchoMatrixGame extends BaseGame {
  constructor(engine) {
    super(engine);

    this.nBack = 2; // Will be scaled by difficulty
    this.history = [];
    this.stepIndex = 0;
    this.stepDuration = 2400; // ms per step
    this.respondedPos = false;
    this.respondedSound = false;
    this.timerInterval = null;

    this.symbols = ['◆', '▲', '●', '✦', '◼', '★'];
  }

  onStart() {
    this.renderStage();
    this.addKeyListener((e) => {
      if (e.repeat) return;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        this.handleResponse('position');
      } else if (e.key === 'l' || e.key === 'L' || e.key === 'ArrowRight') {
        this.handleResponse('sound');
      }
    });
    this.stepIndex = 0;
    this.history = [];
    this.nextStep();
  }

  renderStage() {
    this.mount.innerHTML = `
      <div class="echo-stage">
        <div class="echo-hud-top">
          <div class="echo-n-level" id="echo-n-indicator">Hafıza Başlatılıyor</div>
        </div>

        <div class="echo-grid-container" id="echo-grid">
          ${[0,1,2,3,4,5,6,7,8].map(i => `<div class="echo-cell" data-idx="${i}" id="echo-cell-${i}"></div>`).join('')}
        </div>

        <div class="echo-actions-row">
          <button class="btn-echo-match btn-match-position" id="btn-echo-pos">
            <span>📍 KONUM EŞLEŞTİ</span>
            <span class="btn-hint-key">[A Tuşu]</span>
          </button>
          <button class="btn-echo-match btn-match-sound" id="btn-echo-sound">
            <span>🎵 SES EŞLEŞTİ</span>
            <span class="btn-hint-key">[L Tuşu]</span>
          </button>
        </div>
      </div>
    `;

    const posBtn = document.getElementById('btn-echo-pos');
    const soundBtn = document.getElementById('btn-echo-sound');

    if (posBtn) posBtn.addEventListener('click', () => this.handleResponse('position'));
    if (soundBtn) soundBtn.addEventListener('click', () => this.handleResponse('sound'));
  }

  nextStep() {
    if (!this.engine.isRunning) return;

    this.respondedPos = false;
    this.respondedSound = false;

    // Difficulty scaling
    const level = this.difficulty.getLevel();
    if (level < 4) this.nBack = 1;
    else if (level < 8) this.nBack = 2;
    else this.nBack = 3;

    this.stepDuration = this.difficulty.getTimeLimit(2800, 1500);

    // Reset grid cells
    document.querySelectorAll('.echo-cell').forEach(c => {
      c.classList.remove('active-flash');
      c.textContent = '';
    });

    let pos = Math.floor(Math.random() * 9);
    let soundIdx = Math.floor(Math.random() * 6);

    // Apply match rate if we have enough history
    if (this.history.length >= this.nBack) {
      const past = this.history[this.history.length - this.nBack];
      if (Math.random() < 0.38) pos = past.pos;
      if (Math.random() < 0.38) soundIdx = past.soundIdx;
    }

    const currentItem = { pos, soundIdx, symbol: this.symbols[soundIdx] };
    this.history.push(currentItem);

    // Update status badge
    const ind = document.getElementById('echo-n-indicator');
    if (ind) {
      if (this.history.length <= this.nBack) {
        ind.textContent = `Hafızaya Alınıyor (${this.history.length}/${this.nBack})`;
        ind.style.borderColor = '#ffb703';
        ind.style.color = '#ffb703';
      } else {
        ind.textContent = `⚡ ${this.nBack}-Adım Öncekiyle Karşılaştır!`;
        ind.style.borderColor = '#00f0ff';
        ind.style.color = '#00f0ff';
      }
    }
    
    this.setRule(`Şu anki konum veya ses, tam ${this.nBack} adım öncekiyle aynı mı?`);

    // Flash stimulus
    const targetCell = document.getElementById(`echo-cell-${pos}`);
    if (targetCell) {
      targetCell.classList.add('active-flash');
      targetCell.textContent = currentItem.symbol;
      targetCell.style.color = '#fff';
    }

    if (window.soundEngine) {
      window.soundEngine.playTone(soundIdx);
    }

    this.gameTimeout(() => {
      if (targetCell) {
        targetCell.classList.remove('active-flash');
        targetCell.textContent = '';
      }
    }, 900);

    // Step timeout
    this.timerInterval = this.gameTimeout(() => {
      this.evaluateUnanswered();
      if (this.engine.isRunning) {
        this.nextStep();
      }
    }, this.stepDuration);
  }

  handleResponse(type) {
    if (this.history.length <= this.nBack) return;

    const past = this.history[this.history.length - 1 - this.nBack];
    const current = this.history[this.history.length - 1];

    if (type === 'position') {
      if (this.respondedPos) return;
      this.respondedPos = true;
      const btn = document.getElementById('btn-echo-pos');
      if (btn) btn.classList.add('active-press');
      setTimeout(() => btn && btn.classList.remove('active-press'), 250);

      if (past.pos === current.pos) {
        this.reportSuccess(130 * (this.engine.combo * 0.3 + 1));
      } else {
        this.reportError("Yanlış Konum Eşleşmesi!");
      }
    } else if (type === 'sound') {
      if (this.respondedSound) return;
      this.respondedSound = true;
      const btn = document.getElementById('btn-echo-sound');
      if (btn) btn.classList.add('active-press');
      setTimeout(() => btn && btn.classList.remove('active-press'), 250);

      if (past.soundIdx === current.soundIdx) {
        this.reportSuccess(130 * (this.engine.combo * 0.3 + 1));
      } else {
        this.reportError("Yanlış Frekans Eşleşmesi!");
      }
    }
  }

  evaluateUnanswered() {
    if (this.history.length <= this.nBack) return;

    const past = this.history[this.history.length - 1 - this.nBack];
    const current = this.history[this.history.length - 1];

    let missed = false;
    if (past.pos === current.pos && !this.respondedPos) {
      this.reportError("Kaçırılan Konum Eşleşmesi!");
      missed = true;
    }
    if (!missed && past.soundIdx === current.soundIdx && !this.respondedSound) {
      this.reportError("Kaçırılan Frekans Eşleşmesi!");
      missed = true;
    }

    if (!missed && past.pos !== current.pos && past.soundIdx !== current.soundIdx && !this.respondedPos && !this.respondedSound) {
      this.reportSuccess(40);
    }
  }

  onDestroy() {
    // Timers cleaned up by BaseGame
  }
}

window.EchoMatrixGame = EchoMatrixGame;

GameRegistry.register('echomatrix', {
  name: 'Echo Resonance',
  subtitle: 'Kuantum N-Back',
  description: 'Görsel sembollerin ve harmonik ses tonlarının hafızadaki geçici yankılarını takip edin. Bilimsel olarak akışkan zekayı artıran en gelişmiş N-Back varyantı.',
  fullDescription: 'Hem görsel hem işitsel hafızanızı eşzamanlı olarak zorlayan Dual N-Back antrenmanı.',
  category: 'memory',
  categoryName: 'Çalışma Belleği',
  categoryIcon: '🔮',
  categoryLabel: 'ÇALIŞMA BELLEĞİ',
  icon: '🔮',
  tagClass: 'tag-amber',
  orbClass: 'orb-echo',
  catClass: 'cat-memory',
  tagline: '🔮 Çift Modalite',
  difficultyLabel: 'Yüksek Kapasite',
  cogDimension: 'memory',
  skills: ['Kısa Süreli Bellek', 'Duyusal Ayrıştırma', 'Akışkan Zeka'],
  duration: 45,
  GameClass: EchoMatrixGame
});
