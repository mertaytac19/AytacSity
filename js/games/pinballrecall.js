/**
 * NEUROSYNAPSE - Game: Pinball Recall (Sıralı Konum Hafızası)
 * Tests sequential working memory. Players must remember a sequence of spatial locations 
 * in the exact order they appeared.
 */

class PinballRecallGame extends BaseGame {
  constructor(engine) {
    super(engine);
    this.gridSize = 3; // 3x3 to start
    this.sequenceLength = 3;
    this.sequence = [];
    this.userPicks = [];
    this.phase = 'idle'; // idle, show, recall
  }

  onStart() {
    this.renderStage();
    this.nextRound();
  }

  renderStage() {
    this.mount.innerHTML = `
      <div class="pinball-stage" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        
        <div id="pr-status" style="font-family: var(--font-mono); font-size: 1.2rem; color: var(--neon-cyan); margin-bottom: 20px; font-weight: bold; height: 30px;">
          Hazırlanıyor...
        </div>

        <div id="pr-grid" style="display: grid; gap: 12px; background: rgba(255,255,255,0.05); padding: 24px; border-radius: 50%; border: 2px dashed rgba(0, 240, 255, 0.3); transition: all 0.3s ease;">
          <!-- Dots injected here -->
        </div>

      </div>
    `;
    this.setRule("Ekranda sırayla yanan ışıkları hafızanıza kazıyın ve aynı sırayla tekrar edin.");
  }

  nextRound() {
    const level = this.difficulty.getLevel();
    
    // Scale difficulty
    if (level < 3) {
      this.gridSize = 3;
      this.sequenceLength = 3 + Math.floor(level / 2);
    } else if (level < 6) {
      this.gridSize = 4;
      this.sequenceLength = 4 + Math.floor((level - 3) / 2);
    } else if (level < 9) {
      this.gridSize = 5;
      this.sequenceLength = 5 + Math.floor((level - 6) / 2);
    } else {
      this.gridSize = 6;
      this.sequenceLength = 7 + Math.floor((level - 9));
    }

    this.sequence = [];
    this.userPicks = [];
    
    const totalTiles = this.gridSize * this.gridSize;
    let lastPoint = -1;

    for (let i = 0; i < this.sequenceLength; i++) {
      let r = Math.floor(Math.random() * totalTiles);
      // Avoid immediate repetition
      while (r === lastPoint) {
        r = Math.floor(Math.random() * totalTiles);
      }
      this.sequence.push(r);
      lastPoint = r;
    }

    this.renderGrid();
    
    this.phase = 'show';
    const statusEl = document.getElementById('pr-status');
    if (statusEl) {
      statusEl.textContent = 'DİZİLİMİ İZLEYİN';
      statusEl.style.color = 'var(--neon-amber)';
    }

    // Play sequence
    this.gameTimeout(() => {
      this.playSequence();
    }, 800);
  }

  playSequence() {
    let step = 0;
    // Speed increases with difficulty
    const intervalTime = this.difficulty.getTimeLimit(700, 300);

    const playStep = () => {
      if (step >= this.sequenceLength) {
        this.startRecallPhase();
        return;
      }

      const idx = this.sequence[step];
      const dot = document.getElementById(`pr-dot-${idx}`);
      if (dot) {
        dot.style.background = 'var(--neon-cyan)';
        dot.style.boxShadow = '0 0 20px var(--neon-cyan-glow)';
        dot.style.transform = 'scale(1.3)';
        if (window.soundEngine) window.soundEngine.playTone(step % 6);

        this.gameTimeout(() => {
          if (dot) {
            dot.style.background = 'rgba(255, 255, 255, 0.15)';
            dot.style.boxShadow = 'none';
            dot.style.transform = 'scale(1)';
          }
        }, intervalTime * 0.6);
      }

      step++;
      this.gameTimeout(playStep, intervalTime);
    };

    playStep();
  }

  startRecallPhase() {
    this.phase = 'recall';
    const statusEl = document.getElementById('pr-status');
    if (statusEl) {
      statusEl.textContent = 'SIRAYLA TEKRARLA';
      statusEl.style.color = 'var(--neon-emerald)';
    }

    // Enable hover effects
    const dots = document.querySelectorAll('.pr-dot');
    dots.forEach(dot => {
      dot.style.cursor = 'pointer';
      dot.onmouseenter = () => {
        if (this.phase === 'recall') dot.style.background = 'rgba(255, 255, 255, 0.3)';
      };
      dot.onmouseleave = () => {
        if (this.phase === 'recall') dot.style.background = 'rgba(255, 255, 255, 0.15)';
      };
    });
    
    this.roundStartTime = performance.now();
  }

  renderGrid() {
    const gridEl = document.getElementById('pr-grid');
    if (!gridEl) return;
    
    gridEl.style.gridTemplateColumns = \`repeat(\${this.gridSize}, 1fr)\`;
    
    const dotSize = Math.max(30, 200 / this.gridSize);
    
    let html = '';
    const totalTiles = this.gridSize * this.gridSize;
    for (let i = 0; i < totalTiles; i++) {
      html += \`<div class="pr-dot" id="pr-dot-\${i}" data-idx="\${i}" style="width: \${dotSize}px; height: \${dotSize}px; border-radius: 50%; background: rgba(255, 255, 255, 0.15); transition: all 0.2s ease;"></div>\`;
    }
    gridEl.innerHTML = html;

    const dots = gridEl.querySelectorAll('.pr-dot');
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        if (this.phase !== 'recall') return;
        const idx = parseInt(dot.dataset.idx);
        this.handleDotClick(idx, dot);
      });
    });
  }

  handleDotClick(idx, dotEl) {
    const currentStepIndex = this.userPicks.length;
    const expectedIdx = this.sequence[currentStepIndex];

    if (idx === expectedIdx) {
      // Correct pick
      this.userPicks.push(idx);
      dotEl.style.background = 'var(--neon-emerald)';
      dotEl.style.boxShadow = '0 0 15px var(--neon-emerald-glow)';
      if (window.soundEngine) window.soundEngine.playTone(currentStepIndex % 6);

      setTimeout(() => {
        if (this.phase === 'recall') {
          dotEl.style.background = 'rgba(255, 255, 255, 0.15)';
          dotEl.style.boxShadow = 'none';
        }
      }, 300);
      
      // Check win
      if (this.userPicks.length === this.sequence.length) {
        this.phase = 'idle';
        const reactionTime = Math.round(performance.now() - this.roundStartTime);
        const pts = 150 + Math.round(this.difficulty.getLevel() * 20);
        this.reportSuccess(pts, reactionTime);
        
        const statusEl = document.getElementById('pr-status');
        if (statusEl) {
          statusEl.textContent = 'BAŞARILI';
          statusEl.style.color = 'var(--neon-emerald)';
        }

        this.gameTimeout(() => this.nextRound(), 1000);
      }
    } else {
      // Wrong pick
      this.phase = 'idle';
      dotEl.style.background = 'var(--neon-rose)';
      dotEl.style.boxShadow = '0 0 15px var(--neon-rose-glow)';
      if (window.soundEngine) window.soundEngine.playError();
      
      // Highlight the correct one
      const correctDot = document.getElementById(`pr-dot-${expectedIdx}`);
      if (correctDot) {
        correctDot.style.background = 'var(--neon-cyan)';
        correctDot.style.boxShadow = '0 0 15px var(--neon-cyan-glow)';
      }
      
      this.reportError("Hatalı Sıra!");
      this.gameTimeout(() => this.nextRound(), 1500);
    }
  }

  onDestroy() {}
}

window.PinballRecallGame = PinballRecallGame;

GameRegistry.register('pinballrecall', {
  name: 'Sequence Recall',
  subtitle: 'Sıralı Konum Hafızası',
  description: 'Düğüm noktalarında sırayla beliren enerji akışını zihninizde tutun ve aynı sırayla tekrar edin.',
  fullDescription: 'Uzamsal ve sıralı çalışma belleğini senkronize test eden bu antrenman, olayların kronolojik dizilimini hatırlama kapasitenizi ölçer.',
  category: 'memory',
  categoryName: 'Çalışma Belleği',
  categoryIcon: '🧠',
  categoryLabel: 'HAFIZA & BELLEK',
  icon: '📍',
  tagClass: 'tag-amber',
  orbClass: 'orb-echo',
  catClass: 'cat-memory',
  tagline: '🧬 Kronolojik Hafıza',
  difficultyLabel: 'Gittikçe Zorlaşan',
  cogDimension: 'memory',
  skills: ['Sıralı Bellek', 'Kısa Süreli Hafıza', 'Görsel Odak'],
  duration: 45,
  GameClass: PinballRecallGame
});
