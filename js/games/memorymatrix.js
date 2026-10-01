/**
 * NEUROSYNAPSE - Game: Memory Matrix (Görsel Matris Hafızası)
 * Tests spatial working memory by asking the user to recall a pattern of highlighted tiles.
 */

class MemoryMatrixGame extends BaseGame {
  constructor(engine) {
    super(engine);
    this.gridSize = 3; // 3x3 to start
    this.targetCount = 3;
    this.grid = [];
    this.targets = [];
    this.userPicks = [];
    this.phase = 'idle'; // 'idle', 'memorize', 'recall'
  }

  onStart() {
    this.renderStage();
    this.nextRound();
  }

  renderStage() {
    this.mount.innerHTML = `
      <div class="memory-matrix-stage" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div id="mm-status" style="font-family: var(--font-mono); font-size: 1.2rem; color: var(--neon-cyan); margin-bottom: 20px; font-weight: bold; height: 30px;">
          Hazırlanıyor...
        </div>
        <div id="mm-grid" style="display: grid; gap: 8px; background: rgba(255,255,255,0.05); padding: 16px; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
          <!-- Tiles injected here -->
        </div>
      </div>
    `;
    this.setRule("Yanan karelerin konumunu hafızanıza kazıyın, kaybolduklarında aynı karelere tıklayın.");
  }

  nextRound() {
    const level = this.difficulty.getLevel();
    
    // Scale difficulty
    if (level < 3) {
      this.gridSize = 3;
      this.targetCount = 3 + Math.floor(level / 2); // 3 to 4
    } else if (level < 6) {
      this.gridSize = 4;
      this.targetCount = 4 + Math.floor((level - 3) / 2); // 4 to 5
    } else if (level < 9) {
      this.gridSize = 5;
      this.targetCount = 6 + Math.floor((level - 6) / 2); // 6 to 7
    } else {
      this.gridSize = 6;
      this.targetCount = 8 + Math.floor((level - 9)); // 8+
    }

    // Cap target count so it doesn't fill the whole board
    this.targetCount = Math.min(this.targetCount, Math.floor((this.gridSize * this.gridSize) * 0.5));

    this.targets = [];
    this.userPicks = [];
    
    // Generate targets
    const totalTiles = this.gridSize * this.gridSize;
    while (this.targets.length < this.targetCount) {
      const r = Math.floor(Math.random() * totalTiles);
      if (!this.targets.includes(r)) this.targets.push(r);
    }

    this.renderGrid();
    this.phase = 'memorize';
    const statusEl = document.getElementById('mm-status');
    if (statusEl) {
      statusEl.textContent = 'DESENİ EZBERLE';
      statusEl.style.color = 'var(--neon-amber)';
    }

    // Show targets
    this.targets.forEach(idx => {
      const tile = document.getElementById(`mm-tile-${idx}`);
      if (tile) {
        tile.style.background = 'var(--neon-cyan)';
        tile.style.boxShadow = '0 0 15px var(--neon-cyan-glow)';
        tile.style.transform = 'scale(1.05)';
      }
    });

    if (window.soundEngine) window.soundEngine.playTone(2);

    // Dynamic memorize time based on difficulty
    const memorizeTime = this.difficulty.getTimeLimit(2000, 800);
    
    this.gameTimeout(() => {
      this.startRecallPhase();
    }, memorizeTime);
  }

  startRecallPhase() {
    this.phase = 'recall';
    const statusEl = document.getElementById('mm-status');
    if (statusEl) {
      statusEl.textContent = 'DESENİ GİRİN';
      statusEl.style.color = 'var(--neon-emerald)';
    }

    // Hide targets
    const tiles = document.querySelectorAll('.mm-tile');
    tiles.forEach(tile => {
      tile.style.background = 'rgba(255, 255, 255, 0.1)';
      tile.style.boxShadow = 'none';
      tile.style.transform = 'scale(1)';
      tile.style.cursor = 'pointer';
      
      // Add hover effect dynamically via JS since we don't have CSS class yet
      tile.onmouseenter = () => {
        if (this.phase === 'recall' && !this.userPicks.includes(parseInt(tile.dataset.idx))) {
          tile.style.background = 'rgba(255, 255, 255, 0.2)';
        }
      };
      tile.onmouseleave = () => {
        if (this.phase === 'recall' && !this.userPicks.includes(parseInt(tile.dataset.idx))) {
          tile.style.background = 'rgba(255, 255, 255, 0.1)';
        }
      };
    });
    
    this.roundStartTime = performance.now();
  }

  renderGrid() {
    const gridEl = document.getElementById('mm-grid');
    if (!gridEl) return;
    
    gridEl.style.gridTemplateColumns = \`repeat(\${this.gridSize}, 1fr)\`;
    
    // Dynamic tile size based on grid size
    const tileSize = Math.max(40, 300 / this.gridSize);
    
    let html = '';
    const totalTiles = this.gridSize * this.gridSize;
    for (let i = 0; i < totalTiles; i++) {
      html += \`<div class="mm-tile" id="mm-tile-\${i}" data-idx="\${i}" style="width: \${tileSize}px; height: \${tileSize}px; background: rgba(255, 255, 255, 0.1); border-radius: var(--radius-sm); transition: all 0.2s ease;"></div>\`;
    }
    gridEl.innerHTML = html;

    // Attach click listeners
    const tiles = gridEl.querySelectorAll('.mm-tile');
    tiles.forEach(tile => {
      tile.addEventListener('click', () => {
        if (this.phase !== 'recall') return;
        const idx = parseInt(tile.dataset.idx);
        this.handleTileClick(idx, tile);
      });
    });
  }

  handleTileClick(idx, tileEl) {
    if (this.userPicks.includes(idx)) return; // Already picked
    
    this.userPicks.push(idx);

    if (this.targets.includes(idx)) {
      // Correct pick
      tileEl.style.background = 'var(--neon-emerald)';
      tileEl.style.boxShadow = '0 0 15px var(--neon-emerald-glow)';
      if (window.soundEngine) window.soundEngine.playClick();
      
      // Check win
      if (this.userPicks.length === this.targets.length) {
        this.phase = 'idle';
        const reactionTime = Math.round(performance.now() - this.roundStartTime);
        const pts = 120 + Math.round(this.difficulty.getLevel() * 15);
        this.reportSuccess(pts, reactionTime);
        
        this.gameTimeout(() => this.nextRound(), 600);
      }
    } else {
      // Wrong pick
      this.phase = 'idle';
      tileEl.style.background = 'var(--neon-rose)';
      tileEl.style.boxShadow = '0 0 15px var(--neon-rose-glow)';
      
      // Show missed targets
      this.targets.forEach(tIdx => {
        if (!this.userPicks.includes(tIdx)) {
          const missedTile = document.getElementById(`mm-tile-${tIdx}`);
          if (missedTile) {
            missedTile.style.background = 'var(--neon-cyan)';
            missedTile.style.opacity = '0.5';
          }
        }
      });
      
      this.reportError("Hatalı Kare!");
      this.gameTimeout(() => this.nextRound(), 1000);
    }
  }

  onDestroy() {
    // Handled by BaseGame
  }
}

window.MemoryMatrixGame = MemoryMatrixGame;

GameRegistry.register('memorymatrix', {
  name: 'Memory Matrix',
  subtitle: 'Görsel Matris Hafızası',
  description: 'Ekranda kısa süreliğine beliren hedef karelerin konumunu hafızana kazı ve tekrar işaretle.',
  fullDescription: 'Çalışma belleğinizi ve uzamsal algınızı zorlayan bu testte, matris boyutu ve hedef sayısı başarı oranınıza göre dinamik olarak artar.',
  category: 'memory',
  categoryName: 'Çalışma Belleği',
  categoryIcon: '🧠',
  categoryLabel: 'HAFIZA & BELLEK',
  icon: '🔲',
  tagClass: 'tag-amber',
  orbClass: 'orb-echo',
  catClass: 'cat-memory',
  tagline: '🔮 Uzamsal Hafıza',
  difficultyLabel: 'Dinamik Uyarlamalı',
  cogDimension: 'memory',
  skills: ['Uzamsal Bellek', 'Kısa Süreli Hafıza', 'Görsel Tarama'],
  duration: 45,
  GameClass: MemoryMatrixGame
});
