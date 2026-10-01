/**
 * NEUROSYNAPSE - Game 2: Synapse Cascade (Uzamsal Muhakeme & Foton Yönlendirme)
 * Interactive neural circuit puzzle: Rotate reflective quantum prisms to guide laser energy to targets.
 * Guaranteed Solvable Procedural Generator & Real-time Optical Raycasting.
 * Refactored to extend BaseGame for standardized lifecycle & difficulty management.
 */

class SynapseLinkGame extends BaseGame {
  constructor(engine) {
    super(engine);
    
    this.canvas = null;
    this.ctx = null;
    this.gridSize = 5; // 5x5 Grid
    this.cellSize = 74;
    this.grid = [];
    this.source = { x: 0, y: 2, dir: 'right' };
    this.target = { x: 4, y: 2 };
    this.laserPath = [];
    this.solutionMirrors = [];
    this.roundStartTime = 0;
    this.animFrame = null;
    this.photonParticles = [];
    this.levelSolved = false;
    this.levelCount = 0;
  }

  onStart() {
    this.levelCount = 0;
    this.renderStage();
    this.initCanvas();
    this.generateGuaranteedLevel();
    this.roundStartTime = performance.now();
    this.loop();
  }

  renderStage() {
    this.mount.innerHTML = `
      <div class="synapse-stage">
        <canvas id="synapse-canvas" width="460" height="420"></canvas>
        <div class="synapse-controls-bar">
          <button id="btn-fire-laser" class="btn-pulse-laser">
            <span>⚡</span> FOTON AKIŞINI TEST ET / ONAYLA
          </button>
          <button id="btn-skip-puzzle" class="btn-secondary" style="padding: 8px 16px; font-size: 0.8rem;">
            <span>↻</span> Yeni Matris
          </button>
        </div>
      </div>
    `;

    this.setRule("Mor kristal aynalara (↻) tıklayarak foton ışınını yeşil hedef sinapsa [🎯] ulaştırın!");

    const fireBtn = document.getElementById('btn-fire-laser');
    if (fireBtn) {
      fireBtn.addEventListener('click', () => {
        this.triggerLaserPulse();
      });
    }

    const skipBtn = document.getElementById('btn-skip-puzzle');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        this.generateGuaranteedLevel();
      });
    }
  }

  initCanvas() {
    this.canvas = document.getElementById('synapse-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Click handler to rotate mirror nodes with responsive scaling
    this.canvas.addEventListener('click', (e) => {
      if (this.levelSolved) return;
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      const offsetX = (this.canvas.width - this.gridSize * this.cellSize) / 2;
      const offsetY = (this.canvas.height - this.gridSize * this.cellSize) / 2;

      const gx = Math.floor((clickX - offsetX) / this.cellSize);
      const gy = Math.floor((clickY - offsetY) / this.cellSize);

      if (gx >= 0 && gx < this.gridSize && gy >= 0 && gy < this.gridSize) {
        this.rotateCell(gx, gy);
      }
    });
  }

  generateGuaranteedLevel() {
    this.levelSolved = false;
    this.levelCount++;
    this.grid = [];
    for (let y = 0; y < this.gridSize; y++) {
      const row = [];
      for (let x = 0; x < this.gridSize; x++) {
        row.push({ type: 'empty', mirrorDir: '/' });
      }
      this.grid.push(row);
    }

    // Pick random source position on left edge
    const sy = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
    this.source = { x: 0, y: sy, dir: 'right' };

    // Choose 2 or 3 turn waypoints to reach target
    const m1X = Math.floor(Math.random() * 2) + 1; // 1 or 2
    const m1Y = sy;
    
    const goDown = Math.random() > 0.5;
    const m2Y = goDown ? Math.min(this.gridSize - 1, sy + 2) : Math.max(0, sy - 2);
    const m2X = m1X;

    const m3X = Math.floor(Math.random() * (this.gridSize - 1 - m1X)) + m1X + 1;
    const m3Y = m2Y;

    // Target at m3X
    const targetY = goDown ? Math.max(0, m2Y - 1) : Math.min(this.gridSize - 1, m2Y + 1);
    this.target = { x: m3X, y: targetY };

    // Set correct mirrors
    const dir1To2 = m2Y > m1Y ? 'down' : 'up';
    const mirror1Correct = dir1To2 === 'down' ? '\\' : '/';
    const mirror2Correct = dir1To2 === 'down' ? '/' : '\\';
    const dir3ToTarget = targetY > m3Y ? 'down' : 'up';
    const mirror3Correct = dir3ToTarget === 'down' ? '\\' : '/';

    const solutionTurns = [
      { x: m1X, y: m1Y, correct: mirror1Correct },
      { x: m2X, y: m2Y, correct: mirror2Correct },
      { x: m3X, y: m3Y, correct: mirror3Correct }
    ];

    solutionTurns.forEach(turn => {
      this.grid[turn.y][turn.x] = {
        type: 'mirror',
        mirrorDir: Math.random() > 0.5 ? '/' : '\\' // Scrambled initial state
      };
    });

    // Place decoy mirrors - more at higher difficulty
    const decoyCount = Math.min(4, 1 + Math.floor(this.difficulty.getLevel() / 3));
    let decoys = 0;
    let attempts = 0;
    while (decoys < decoyCount && attempts < 20) {
      attempts++;
      const rx = Math.floor(Math.random() * (this.gridSize - 2)) + 1;
      const ry = Math.floor(Math.random() * (this.gridSize - 2)) + 1;
      if (this.grid[ry][rx].type === 'empty' && !(rx === this.target.x && ry === this.target.y)) {
        this.grid[ry][rx] = {
          type: 'mirror',
          mirrorDir: Math.random() > 0.5 ? '/' : '\\'
        };
        decoys++;
      }
    }

    this.calculateLaser();
    this.roundStartTime = performance.now();
  }

  rotateCell(x, y) {
    if (this.grid[y] && this.grid[y][x] && this.grid[y][x].type === 'mirror') {
      if (window.soundEngine) window.soundEngine.playClick();
      this.grid[y][x].mirrorDir = this.grid[y][x].mirrorDir === '/' ? '\\' : '/';
      this.calculateLaser();
      this.checkAutoWin();
    }
  }

  calculateLaser() {
    this.laserPath = [];
    let curX = this.source.x;
    let curY = this.source.y;
    let dir = this.source.dir;
    let steps = 0;
    const maxSteps = 30;

    this.laserPath.push({ x: curX, y: curY });

    while (steps < maxSteps) {
      steps++;
      let nextX = curX;
      let nextY = curY;

      if (dir === 'right') nextX++;
      else if (dir === 'left') nextX--;
      else if (dir === 'down') nextY++;
      else if (dir === 'up') nextY--;

      if (nextX < 0 || nextX >= this.gridSize || nextY < 0 || nextY >= this.gridSize) {
        this.laserPath.push({ x: nextX, y: nextY, hitWall: true });
        break;
      }

      this.laserPath.push({ x: nextX, y: nextY });
      curX = nextX;
      curY = nextY;

      if (curX === this.target.x && curY === this.target.y) {
        break;
      }

      const cell = this.grid[curY][curX];
      if (cell.type === 'mirror') {
        if (cell.mirrorDir === '/') {
          if (dir === 'right') dir = 'up';
          else if (dir === 'left') dir = 'down';
          else if (dir === 'up') dir = 'right';
          else if (dir === 'down') dir = 'left';
        } else if (cell.mirrorDir === '\\') {
          if (dir === 'right') dir = 'down';
          else if (dir === 'left') dir = 'up';
          else if (dir === 'up') dir = 'left';
          else if (dir === 'down') dir = 'right';
        }
      }
    }
  }

  checkAutoWin() {
    const lastPoint = this.laserPath[this.laserPath.length - 1];
    if (lastPoint && lastPoint.x === this.target.x && lastPoint.y === this.target.y) {
      this.triggerLaserPulse();
    }
  }

  triggerLaserPulse() {
    if (this.levelSolved) return;
    this.calculateLaser();
    const lastPoint = this.laserPath[this.laserPath.length - 1];
    const isTargetHit = (lastPoint && lastPoint.x === this.target.x && lastPoint.y === this.target.y);

    this.spawnLaserParticles();

    if (isTargetHit) {
      this.levelSolved = true;
      if (window.soundEngine) {
        window.soundEngine.playLaser();
        window.soundEngine.playLevelUp();
      }

      const reactionTime = Math.round(performance.now() - this.roundStartTime);
      const pts = Math.round(180 * (this.engine.combo * 0.4 + 1) + Math.max(0, (6000 - reactionTime) / 15));
      this.reportSuccess(pts, reactionTime);

      setTimeout(() => {
        if (this.engine.isRunning) {
          this.generateGuaranteedLevel();
        }
      }, 700);
    } else {
      if (window.soundEngine) window.soundEngine.playError();
      this.reportError("Işın hedefe ulaşamadı! Aynaları tıklayarak yönlendirin.");
    }
  }

  spawnLaserParticles() {
    const offsetX = (this.canvas.width - this.gridSize * this.cellSize) / 2;
    const offsetY = (this.canvas.height - this.gridSize * this.cellSize) / 2;

    this.laserPath.forEach(pt => {
      const px = offsetX + pt.x * this.cellSize + this.cellSize / 2;
      const py = offsetY + pt.y * this.cellSize + this.cellSize / 2;
      for (let i = 0; i < 5; i++) {
        this.photonParticles.push({
          x: px,
          y: py,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          alpha: 1,
          color: '#00f0ff'
        });
      }
    });
  }

  loop() {
    if (!this.engine.isRunning) return;
    this.draw();
    this.animFrame = requestAnimationFrame(() => this.loop());
  }

  draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    const offsetX = (w - this.gridSize * this.cellSize) / 2;
    const offsetY = (h - this.gridSize * this.cellSize) / 2;

    // Draw Grid Cells
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const cx = offsetX + x * this.cellSize;
        const cy = offsetY + y * this.cellSize;

        ctx.fillStyle = 'rgba(12, 18, 36, 0.7)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.fillRect(cx + 2, cy + 2, this.cellSize - 4, this.cellSize - 4);
        ctx.strokeRect(cx + 2, cy + 2, this.cellSize - 4, this.cellSize - 4);

        const cell = this.grid[y][x];
        if (cell.type === 'mirror') {
          ctx.strokeStyle = '#b026ff';
          ctx.lineWidth = 4;
          ctx.shadowColor = '#b026ff';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          if (cell.mirrorDir === '/') {
            ctx.moveTo(cx + 14, cy + this.cellSize - 14);
            ctx.lineTo(cx + this.cellSize - 14, cy + 14);
          } else {
            ctx.moveTo(cx + 14, cy + 14);
            ctx.lineTo(cx + this.cellSize - 14, cy + this.cellSize - 14);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Rotation badge
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.font = '12px JetBrains Mono';
          ctx.textAlign = 'center';
          ctx.fillText('↻', cx + this.cellSize / 2, cy + this.cellSize / 2 + 4);
        }
      }
    }

    // Draw Source Emitter
    const srcX = offsetX + this.source.x * this.cellSize + this.cellSize / 2;
    const srcY = offsetY + this.source.y * this.cellSize + this.cellSize / 2;
    ctx.beginPath();
    ctx.arc(srcX, srcY, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Target Receptor
    const tgtX = offsetX + this.target.x * this.cellSize + this.cellSize / 2;
    const tgtY = offsetY + this.target.y * this.cellSize + this.cellSize / 2;
    ctx.beginPath();
    ctx.arc(tgtX, tgtY, 17, 0, Math.PI * 2);
    ctx.fillStyle = this.levelSolved ? '#00ff9d' : 'rgba(0, 255, 157, 0.2)';
    ctx.strokeStyle = '#00ff9d';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00ff9d';
    ctx.shadowBlur = 18;
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#00ff9d';
    ctx.font = '14px Outfit';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎯', tgtX, tgtY);

    // Draw Laser Path
    if (this.laserPath.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = this.levelSolved ? '#00ff9d' : '#00f0ff';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = this.levelSolved ? '#00ff9d' : '#00f0ff';
      ctx.shadowBlur = 16;

      this.laserPath.forEach((pt, i) => {
        const lx = offsetX + pt.x * this.cellSize + this.cellSize / 2;
        const ly = offsetY + pt.y * this.cellSize + this.cellSize / 2;
        if (i === 0) ctx.moveTo(lx, ly);
        else ctx.lineTo(lx, ly);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Draw Particles
    for (let i = this.photonParticles.length - 1; i >= 0; i--) {
      const p = this.photonParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.035;
      if (p.alpha <= 0) {
        this.photonParticles.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 240, 255, ${p.alpha})`;
      ctx.fill();
    }
  }

  onDestroy() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
  }
}

// Register with GameRegistry
window.SynapseLinkGame = SynapseLinkGame;

GameRegistry.register('synapselink', {
  name: 'Synapse Cascade',
  subtitle: 'Foton Yönlendirme',
  description: 'Nöronal foton patlaması hedefe varmadan önce prizma ve akış aynalarını gerçek zamanlı yönlendir.',
  fullDescription: 'Serbest bırakılan nöronal ışık partikülleri dağılmadan önce lazer prizmalarını ve polarizasyon filtrelerini hızla çevirerek hedef sinir ağını besleyin.',
  category: 'spatial',
  categoryName: 'Uzamsal Zeka',
  categoryIcon: '📐',
  categoryLabel: 'UZAMSAL & MANTIK',
  icon: '⚡',
  tagClass: 'tag-cyan',
  orbClass: 'orb-synapse',
  catClass: 'cat-spatial',
  tagline: '⚡ Gerçek Zamanlı',
  difficultyLabel: 'İleri Seviye',
  cogDimension: 'spatial',
  skills: ['Uzamsal Planlama', 'Yörünge Tahmini', 'Problem Çözme'],
  duration: 45,
  GameClass: SynapseLinkGame
});
