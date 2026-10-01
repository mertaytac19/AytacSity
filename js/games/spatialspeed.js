/**
 * NEUROSYNAPSE - Game: Spatial Speed Match (Döndürülmüş Şekil Hızı)
 * Tests mental rotation and spatial processing speed.
 */

class SpatialSpeedGame extends BaseGame {
  constructor(engine) {
    super(engine);
    this.shapes = ['F', 'P', 'R', 'L', 'J', 'Q']; // Asymmetrical letters make good shapes
    this.currentShape = 'F';
    this.isMatch = false;
    this.rotLeft = 0;
    this.rotRight = 0;
    this.flipRight = 1; // 1 or -1
    this.roundStartTime = 0;
    this.roundTimer = null;
  }

  onStart() {
    this.renderStage();
    this.addKeyListener((e) => {
      if (e.repeat) return;
      if (['ArrowLeft', 'a', 'A', '1'].includes(e.key)) {
        this.submitAnswer(true);
      } else if (['ArrowRight', 'd', 'D', '2'].includes(e.key)) {
        this.submitAnswer(false);
      }
    });
    this.nextRound();
  }

  renderStage() {
    this.mount.innerHTML = `
      <div class="ss-stage" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        
        <div style="display: flex; gap: 40px; align-items: center; justify-content: center;">
          
          <!-- Left Shape (Reference) -->
          <div id="ss-left-box" style="width: 150px; height: 150px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); border: 2px solid var(--neon-cyan); border-radius: var(--radius-lg); box-shadow: 0 0 20px rgba(0, 240, 255, 0.1);">
            <div id="ss-left-shape" style="font-family: Arial, sans-serif; font-size: 8rem; font-weight: bold; color: var(--neon-cyan); transition: transform 0.2s; filter: drop-shadow(0 0 10px rgba(0, 240, 255, 0.5));">F</div>
          </div>

          <!-- Divider -->
          <div style="color: var(--text-muted); font-family: var(--font-mono); font-size: 1.2rem;">VS</div>

          <!-- Right Shape (Target) -->
          <div id="ss-right-box" style="width: 150px; height: 150px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); border: 2px solid var(--neon-emerald); border-radius: var(--radius-lg); box-shadow: 0 0 20px rgba(0, 255, 157, 0.1);">
            <div id="ss-right-shape" style="font-family: Arial, sans-serif; font-size: 8rem; font-weight: bold; color: var(--neon-emerald); transition: transform 0.2s; filter: drop-shadow(0 0 10px rgba(0, 255, 157, 0.5));">F</div>
          </div>

        </div>

        <div class="ss-controls" style="display: flex; gap: 20px; margin-top: 50px; width: 100%; max-width: 400px;">
          <button class="ss-btn btn-match-true" id="btn-ss-same" style="flex: 1; padding: 15px; border-radius: var(--radius-md); font-weight: bold; background: rgba(0, 255, 157, 0.1); border: 1px solid var(--neon-emerald); color: var(--neon-emerald); cursor: pointer;">
            ✔ AYNI ŞEKİL (A)
          </button>
          <button class="ss-btn btn-match-false" id="btn-ss-diff" style="flex: 1; padding: 15px; border-radius: var(--radius-md); font-weight: bold; background: rgba(255, 0, 85, 0.1); border: 1px solid var(--neon-rose); color: var(--neon-rose); cursor: pointer;">
            ✖ AYNALANMIŞ (D)
          </button>
        </div>

      </div>
    `;

    this.setRule("Sağdaki şekil, soldakinin sadece döndürülmüş hali mi? (Aynı Şekil) Yoksa ters çevrilmiş (Aynalanmış) hali mi?");

    const sameBtn = document.getElementById('btn-ss-same');
    const diffBtn = document.getElementById('btn-ss-diff');

    if (sameBtn) sameBtn.addEventListener('click', () => this.submitAnswer(true));
    if (diffBtn) diffBtn.addEventListener('click', () => this.submitAnswer(false));
  }

  nextRound() {
    this.clearGameTimeout(this.roundTimer);

    // About 50/50 chance for it to be a match (just rotated) vs mirrored
    this.isMatch = Math.random() > 0.5;
    this.currentShape = this.shapes[Math.floor(Math.random() * this.shapes.length)];
    
    // Rotations in increments of 90 degrees, but at higher difficulties allow 45 deg or weird angles
    const level = this.difficulty.getLevel();
    const angleIncrements = level > 5 ? 45 : 90;
    
    this.rotLeft = Math.floor(Math.random() * (360 / angleIncrements)) * angleIncrements;
    this.rotRight = Math.floor(Math.random() * (360 / angleIncrements)) * angleIncrements;

    // Ensure right rotation is visually distinct
    if (this.rotLeft === this.rotRight) {
      this.rotRight = (this.rotRight + 180) % 360;
    }

    this.flipRight = this.isMatch ? 1 : -1;

    this.renderShapes();

    this.roundStartTime = performance.now();
    const timeLimit = this.difficulty.getTimeLimit(4000, 1500); // More time needed for mental rotation than simple speed
    
    this.roundTimer = this.gameTimeout(() => {
      this.handleTimeout();
    }, timeLimit);
  }

  renderShapes() {
    const leftBox = document.getElementById('ss-left-box');
    const rightBox = document.getElementById('ss-right-box');
    const leftEl = document.getElementById('ss-left-shape');
    const rightEl = document.getElementById('ss-right-shape');
    
    if (!leftEl || !rightEl) return;

    // Pop effect
    leftBox.style.transform = 'scale(0.9)';
    rightBox.style.transform = 'scale(0.9)';
    leftEl.style.opacity = '0';
    rightEl.style.opacity = '0';

    requestAnimationFrame(() => {
      setTimeout(() => {
        leftEl.textContent = this.currentShape;
        rightEl.textContent = this.currentShape;

        leftEl.style.transform = `rotate(${this.rotLeft}deg)`;
        rightEl.style.transform = `rotate(${this.rotRight}deg) scaleX(${this.flipRight})`;

        leftBox.style.transform = 'scale(1)';
        rightBox.style.transform = 'scale(1)';
        leftEl.style.opacity = '1';
        rightEl.style.opacity = '1';

        if (window.soundEngine) window.soundEngine.playTone(4);
      }, 50);
    });
  }

  submitAnswer(userSaysSame) {
    this.clearGameTimeout(this.roundTimer);
    const reactionTime = Math.round(performance.now() - this.roundStartTime);

    const isCorrect = (userSaysSame === this.isMatch);

    if (isCorrect) {
      const speedBonus = Math.max(0, Math.round((2000 - reactionTime) / 10));
      const pts = 110 + speedBonus + Math.round(this.difficulty.getLevel() * 12);
      this.reportSuccess(pts, reactionTime);
    } else {
      this.reportError("Hatalı Algı!");
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

  onDestroy() {}
}

window.SpatialSpeedGame = SpatialSpeedGame;

GameRegistry.register('spatialspeed', {
  name: 'Spatial Rotation',
  subtitle: 'Zihinsel Döndürme Hızı',
  description: 'Sağdaki şekli zihninizde döndürerek soldaki şeklin aynısı mı yoksa ayna görüntüsü mü olduğunu çok hızlı tespit edin.',
  fullDescription: 'Uzamsal zekayı ve zihinsel döndürme becerisini zaman baskısı altında test eden zorlu bir simülasyon.',
  category: 'speed', // Could also be 'spatial', we'll put it in 'speed' due to time pressure
  categoryName: 'İşlem Hızı',
  categoryIcon: '⏱️',
  categoryLabel: 'HIZ & REFLEKS',
  icon: '🌪️',
  tagClass: 'tag-emerald',
  orbClass: 'orb-temporal',
  catClass: 'cat-speed',
  tagline: '🌪️ Zihinsel Döndürme',
  difficultyLabel: 'Dinamik Uyarlamalı',
  cogDimension: 'speed',
  skills: ['Mental Döndürme', 'Uzamsal Algı', 'Karar Verme Hızı'],
  duration: 45,
  GameClass: SpatialSpeedGame
});
