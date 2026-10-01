/**
 * NEUROSYNAPSE - Game 1: ChromaPulse (Kuantum İnhibisyon & Esneklik)
 * Tests cognitive inhibition, Stroop-overcoming flexibility, and rapid task-switching.
 * Refactored to extend BaseGame for standardized lifecycle & difficulty management.
 */

class ChromaShiftGame extends BaseGame {
  constructor(engine) {
    super(engine);
    
    this.shapes = [
      { id: 'circle', symbol: '⬤', name: 'Daire', sides: 1 },
      { id: 'triangle', symbol: '▲', name: 'Üçgen', sides: 3 },
      { id: 'square', symbol: '■', name: 'Kare', sides: 4 },
      { id: 'hexagon', symbol: '⬢', name: 'Altıgen', sides: 6 }
    ];

    this.colors = [
      { id: 'cyan', hex: '#00f0ff', name: 'Siyan' },
      { id: 'magenta', hex: '#d946ef', name: 'Magenta' },
      { id: 'amber', hex: '#ffb703', name: 'Kehribar' },
      { id: 'emerald', hex: '#00ff9d', name: 'Zümrüt' }
    ];

    this.rules = [
      { id: 'match_color', label: 'HEDEF RENGİ EŞLE', instruction: 'Merkezin RENGİYLE aynı renkteki butona bas! (Şekli yoksay)' },
      { id: 'match_shape', label: 'HEDEF ŞEKLİ EŞLE', instruction: 'Merkezin ŞEKLİYLE aynı sembole bas! (Rengi yoksay)' },
      { id: 'invert_both', label: '⚠️ TERS FİLTRE: FARKLIYI BUL', instruction: 'Merkezle NE RENGİ NE DE ŞEKLİ uyuşmayan butona bas!' },
      { id: 'more_sides', label: '🧬 DAHA FAZLA KENARLI', instruction: 'Merkezden DAHA FAZLA kenarı olan butona bas!' }
    ];

    this.currentRule = null;
    this.currentTarget = null;
    this.options = [];
    this.roundStartTime = 0;
    this.roundTimer = null;
  }

  onStart() {
    this.renderStage();
    this.addKeyListener((e) => {
      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key) - 1;
        if (this.options[idx]) {
          this.submitAnswer(this.options[idx]);
        }
      }
    });
    this.nextRound();
  }

  renderStage() {
    this.mount.innerHTML = `
      <div class="chroma-stage">
        <div id="chroma-rule-box" class="chroma-rule-display">
          <span id="chroma-condition-tag" class="rule-condition-badge">KURAL YÜKLENİYOR</span>
          <span id="chroma-main-rule" class="rule-main-instruction">...</span>
        </div>

        <div class="chroma-target-center" id="chroma-target-wrap">
          <div class="pulse-ring" id="chroma-pulse-ring"></div>
          <div class="core-shape" id="chroma-center-shape">▲</div>
        </div>

        <div class="chroma-options-grid" id="chroma-options">
          <!-- Injected dynamically -->
        </div>
      </div>
    `;
  }

  nextRound() {
    clearTimeout(this.roundTimer);

    // Pick rule - harder rules unlocked at higher difficulty levels
    const level = this.difficulty.getLevel();
    const rnd = Math.random();

    if (level >= 4 && rnd < 0.35) {
      this.currentRule = this.rules[2]; // Invert
    } else if (level >= 6 && rnd < 0.5) {
      this.currentRule = this.rules[3]; // More sides
    } else if (this.engine.combo > 4 && rnd < 0.35) {
      this.currentRule = this.rules[2];
    } else if (this.engine.combo > 6 && rnd < 0.5) {
      this.currentRule = this.rules[3];
    } else {
      this.currentRule = Math.random() > 0.5 ? this.rules[0] : this.rules[1];
    }

    // Pick central target (for more_sides, avoid hexagon as target)
    let candidateShapes = this.shapes;
    if (this.currentRule.id === 'more_sides') {
      candidateShapes = this.shapes.filter(s => s.sides < 6);
    }

    const targetShape = candidateShapes[Math.floor(Math.random() * candidateShapes.length)];
    const targetColor = this.colors[Math.floor(Math.random() * this.colors.length)];
    this.currentTarget = { shape: targetShape, color: targetColor };

    // Update UI Rule display
    const ruleBox = document.getElementById('chroma-rule-box');
    const condTag = document.getElementById('chroma-condition-tag');
    const mainRule = document.getElementById('chroma-main-rule');
    const centerShape = document.getElementById('chroma-center-shape');
    const pulseRing = document.getElementById('chroma-pulse-ring');

    if (condTag) condTag.textContent = this.currentRule.label;
    if (mainRule) mainRule.textContent = this.currentRule.instruction;
    this.setRule(`Aktif Talimat: ${this.currentRule.instruction}`);

    if (ruleBox) {
      if (this.currentRule.id === 'invert_both') {
        ruleBox.classList.add('inversion-active');
      } else {
        ruleBox.classList.remove('inversion-active');
      }
    }

    if (centerShape) {
      centerShape.textContent = targetShape.symbol;
      centerShape.style.color = targetColor.hex;
      centerShape.style.textShadow = `0 0 25px ${targetColor.hex}`;
    }

    if (pulseRing) {
      pulseRing.style.borderColor = targetColor.hex;
    }

    // Generate 4 candidate buttons, ensuring exactly 1 satisfies the current rule
    this.generateOptions();
    this.roundStartTime = performance.now();

    // Use DifficultyManager for adaptive time limits
    const timeLimit = this.difficulty.getTimeLimit(2600, 1300);
    this.roundTimer = setTimeout(() => {
      this.handleTimeout();
    }, timeLimit);
  }

  isOptionCorrect(opt) {
    if (this.currentRule.id === 'match_color') {
      return opt.color.id === this.currentTarget.color.id;
    }
    if (this.currentRule.id === 'match_shape') {
      return opt.shape.id === this.currentTarget.shape.id;
    }
    if (this.currentRule.id === 'invert_both') {
      return opt.color.id !== this.currentTarget.color.id && opt.shape.id !== this.currentTarget.shape.id;
    }
    if (this.currentRule.id === 'more_sides') {
      return opt.shape.sides > this.currentTarget.shape.sides;
    }
    return false;
  }

  generateOptions() {
    const optsContainer = document.getElementById('chroma-options');
    if (!optsContainer) return;

    // Build unique deck of 16 possibilities
    const allCombos = [];
    this.shapes.forEach(s => {
      this.colors.forEach(c => {
        allCombos.push({ shape: s, color: c });
      });
    });

    allCombos.sort(() => Math.random() - 0.5);

    const correctList = allCombos.filter(c => this.isOptionCorrect(c));
    const incorrectList = allCombos.filter(c => !this.isOptionCorrect(c));

    const validOption = correctList[0];
    const pickedDistractors = incorrectList.slice(0, 3);

    const final4 = [validOption, ...pickedDistractors].sort(() => Math.random() - 0.5);
    this.options = final4;

    optsContainer.innerHTML = final4.map((opt, i) => `
      <button class="chroma-btn" data-index="${i}" style="border-color: ${opt.color.hex}66;">
        <span class="btn-shape" style="color: ${opt.color.hex}; text-shadow: 0 0 16px ${opt.color.hex};">${opt.shape.symbol}</span>
        <span class="btn-label" style="color: #94a3b8;">${opt.shape.name} // [${i + 1}]</span>
      </button>
    `).join('');

    const btns = optsContainer.querySelectorAll('.chroma-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        this.submitAnswer(this.options[idx]);
      });
    });
  }

  submitAnswer(chosenOption) {
    clearTimeout(this.roundTimer);
    const reactionTime = Math.round(performance.now() - this.roundStartTime);

    const isCorrect = this.isOptionCorrect(chosenOption);

    if (isCorrect) {
      const pts = Math.round(100 * (this.engine.combo * 0.5 + 1) + Math.max(0, (2200 - reactionTime) / 12));
      this.reportSuccess(pts, reactionTime);
    } else {
      this.reportError("Hatalı Eşleme!");
    }

    if (this.engine.isRunning) {
      this.nextRound();
    }
  }

  handleTimeout() {
    this.reportError("Zaman Aşımı!");
    if (this.engine.isRunning) {
      this.nextRound();
    }
  }

  onDestroy() {
    clearTimeout(this.roundTimer);
  }
}

// Register with GameRegistry
window.ChromaShiftGame = ChromaShiftGame;

GameRegistry.register('chromashift', {
  name: 'ChromaPulse',
  subtitle: 'Kuantum İnhibisyon',
  description: 'Değişen kuantum zemin titreşimlerine göre ters kurallarla hedefleri eşle. Zihinsel frenleme gücünü zorla.',
  fullDescription: 'Beynin otomatik tepki verme eğilimini (Stroop etkisini aşan 4\'lü kural motoruyla) bastırarak ani ortam değişimlerine uyum sağlayın.',
  category: 'flexibility',
  categoryName: 'Bilişsel Esneklik',
  categoryIcon: '🔄',
  categoryLabel: 'ESNEKLİK & DİKKAT',
  icon: '⚛️',
  tagClass: 'tag-magenta',
  orbClass: 'orb-chroma',
  catClass: 'cat-flex',
  tagline: '🔥 Yüksek Zorluk',
  difficultyLabel: 'Dinamik Uyarlamalı',
  cogDimension: 'flexibility',
  skills: ['İnhibitör Kontrol', 'Görev Değiştirme', 'Seçici Dikkat'],
  duration: 45,
  GameClass: ChromaShiftGame
});
