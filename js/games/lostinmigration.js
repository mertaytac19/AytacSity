/**
 * NEUROSYNAPSE - Game: Lost in Migration (Kuş Sürüsü Yönü)
 * Tests selective attention and inhibition by asking the user to identify the direction 
 * of the center object while ignoring the flanking distractors.
 */

class LostInMigrationGame extends BaseGame {
  constructor(engine) {
    super(engine);
    this.directions = ['Up', 'Right', 'Down', 'Left'];
    this.dirToRotation = { 'Up': 270, 'Right': 0, 'Down': 90, 'Left': 180 };
    this.centerDir = 'Right';
    this.flankDir = 'Right';
    this.roundStartTime = 0;
    this.roundTimer = null;
  }

  onStart() {
    this.renderStage();
    this.addKeyListener((e) => {
      const key = e.key;
      if (['ArrowUp', 'w', 'W'].includes(key)) this.submitAnswer('Up');
      else if (['ArrowRight', 'd', 'D'].includes(key)) this.submitAnswer('Right');
      else if (['ArrowDown', 's', 'S'].includes(key)) this.submitAnswer('Down');
      else if (['ArrowLeft', 'a', 'A'].includes(key)) this.submitAnswer('Left');
    });
    this.nextRound();
  }

  renderStage() {
    this.mount.innerHTML = \`
      <div class="lim-stage" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        
        <div id="lim-flock-container" style="display: flex; gap: 15px; align-items: center; justify-content: center; height: 200px;">
          <!-- Flock injected here -->
        </div>

        <div class="lim-controls" style="display: grid; grid-template-areas: '. up .' 'left down right'; gap: 10px; margin-top: 40px;">
          <button class="lim-btn" data-dir="Up" style="grid-area: up; padding: 15px; border-radius: var(--radius-sm); background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); color: #fff; cursor: pointer;">⬆️ (W)</button>
          <button class="lim-btn" data-dir="Left" style="grid-area: left; padding: 15px; border-radius: var(--radius-sm); background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); color: #fff; cursor: pointer;">⬅️ (A)</button>
          <button class="lim-btn" data-dir="Down" style="grid-area: down; padding: 15px; border-radius: var(--radius-sm); background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); color: #fff; cursor: pointer;">⬇️ (S)</button>
          <button class="lim-btn" data-dir="Right" style="grid-area: right; padding: 15px; border-radius: var(--radius-sm); background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); color: #fff; cursor: pointer;">➡️ (D)</button>
        </div>

      </div>
    \`;
    this.setRule("Yalnızca ORTADAKİ okun baktığı yönü seçin. Etraftaki oklara aldanmayın!");

    const btns = this.mount.querySelectorAll('.lim-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.submitAnswer(btn.dataset.dir);
      });
    });
  }

  nextRound() {
    this.clearGameTimeout(this.roundTimer);

    // Determine configuration based on difficulty
    const level = this.difficulty.getLevel();
    const isCongruent = Math.random() > (0.3 + (level * 0.05)); // Less congruent at higher levels
    
    this.centerDir = this.directions[Math.floor(Math.random() * this.directions.length)];
    
    if (isCongruent) {
      this.flankDir = this.centerDir;
    } else {
      let fDir = this.centerDir;
      while (fDir === this.centerDir) {
        fDir = this.directions[Math.floor(Math.random() * this.directions.length)];
      }
      this.flankDir = fDir;
    }

    const flockCount = level > 5 ? (Math.random() > 0.5 ? 5 : 7) : 5; // 5 or 7 birds
    const scatter = level > 7 ? true : false; // Scatter birds vertically at high levels
    
    this.renderFlock(flockCount, scatter);

    this.roundStartTime = performance.now();

    // Time limit shrinks as difficulty increases
    const timeLimit = this.difficulty.getTimeLimit(3000, 1000);
    
    this.roundTimer = this.gameTimeout(() => {
      this.handleTimeout();
    }, timeLimit);
  }

  renderFlock(count, scatter) {
    const container = document.getElementById('lim-flock-container');
    if (!container) return;

    let html = '';
    const centerIdx = Math.floor(count / 2);
    
    for (let i = 0; i < count; i++) {
      const isCenter = i === centerIdx;
      const dir = isCenter ? this.centerDir : this.flankDir;
      const rot = this.dirToRotation[dir];
      
      const color = isCenter ? 'var(--neon-cyan)' : 'var(--text-secondary)';
      const scale = isCenter ? 'scale(1.2)' : 'scale(1)';
      const translateY = scatter ? \`translateY(\${(Math.random() - 0.5) * 40}px)\` : 'translateY(0)';
      
      // Using a sharp modern arrow/bird shape
      html += \`
        <div class="lim-bird" style="
          font-size: 3rem; 
          color: \${color}; 
          transform: \${scale} \${translateY} rotate(\${rot}deg);
          transition: transform 0.2s ease;
          filter: drop-shadow(0 0 \${isCenter ? '10px' : '0px'} var(--neon-cyan-glow));
        ">➔</div>
      \`;
    }
    
    container.innerHTML = html;
    
    // Quick entry animation
    container.style.opacity = '0';
    container.style.transform = 'scale(0.8)';
    requestAnimationFrame(() => {
      container.style.transition = 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      container.style.opacity = '1';
      container.style.transform = 'scale(1)';
    });
  }

  submitAnswer(dir) {
    this.clearGameTimeout(this.roundTimer);
    const reactionTime = Math.round(performance.now() - this.roundStartTime);

    if (dir === this.centerDir) {
      const speedBonus = Math.max(0, Math.round((1500 - reactionTime) / 10));
      const pts = 80 + speedBonus + Math.round(this.difficulty.getLevel() * 10);
      this.reportSuccess(pts, reactionTime);
    } else {
      this.reportError("Hatalı Yön!");
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
    // Timers cleaned up by BaseGame
  }
}

window.LostInMigrationGame = LostInMigrationGame;

GameRegistry.register('lostinmigration', {
  name: 'Focus Flock',
  subtitle: 'Seçici Yönlendirme',
  description: 'Dikkat dağıtıcı sürünün içinde sadece merkezdeki hedefin yönünü belirle.',
  fullDescription: 'Çevresel çeldiricileri (flankers) filtreleyerek yalnızca merkeze odaklanmanızı sağlayan klasik bir Flanker Görevi. İnhibitör kontrolünüzü keskinleştirir.',
  category: 'attention',
  categoryName: 'Seçici Dikkat',
  categoryIcon: '🎯',
  categoryLabel: 'DİKKAT & ODAK',
  icon: '🦅',
  tagClass: 'tag-magenta', // Using existing tag
  orbClass: 'orb-chroma',  // Using existing orb
  catClass: 'cat-flex',    // Reusing styling
  tagline: '🎯 Odak Filtresi',
  difficultyLabel: 'Dinamik Uyarlamalı',
  cogDimension: 'focus',
  skills: ['İnhibisyon', 'Seçici Dikkat', 'Tepki Hızı'],
  duration: 45,
  GameClass: LostInMigrationGame
});
