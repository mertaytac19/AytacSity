/**
 * NEUROSYNAPSE - Game: Train of Thought (Tren Yönlendirme)
 * Tests divided attention and routing planning. Players toggle switches 
 * to guide moving particles to destinations matching their color.
 */

class TrainOfThoughtGame extends BaseGame {
  constructor(engine) {
    super(engine);
    this.trains = [];
    this.switches = [
      { id: 'sw-0', x: 200, y: 80, state: 0 }, // Root
      { id: 'sw-1', x: 100, y: 180, state: 0 }, // Left branch
      { id: 'sw-2', x: 300, y: 180, state: 0 }  // Right branch
    ];
    this.stations = [
      { id: 'st-0', x: 50, y: 280, color: '#00f0ff' }, // Cyan
      { id: 'st-1', x: 150, y: 280, color: '#d946ef' }, // Magenta
      { id: 'st-2', x: 250, y: 280, color: '#ffb703' }, // Amber
      { id: 'st-3', x: 350, y: 280, color: '#00ff9d' }  // Emerald
    ];
    this.colors = ['#00f0ff', '#d946ef', '#ffb703', '#00ff9d'];
    this.spawnTimer = null;
    this.animFrame = null;
    this.trainIdCounter = 0;
    this.lastSpawnTime = 0;
  }

  onStart() {
    this.renderStage();
    this.loop();
    this.scheduleSpawn();
  }

  renderStage() {
    this.mount.innerHTML = `
      <div class="tot-stage" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
        
        <!-- Controls UI -->
        <div style="position: absolute; top: 10px; width: 100%; text-align: center; color: var(--text-muted); font-size: 0.8rem; font-family: var(--font-mono);">
          Makasları değiştirmek için üzerlerine TIKLA!
        </div>

        <div style="position: relative; width: 400px; height: 320px; margin-top: 20px;">
          <!-- Track Lines (SVG) -->
          <svg width="400" height="320" style="position: absolute; top: 0; left: 0; pointer-events: none;">
            <!-- Root to Layer 1 -->
            <path d="M200,30 L200,80 L100,180" stroke="rgba(255,255,255,0.1)" stroke-width="4" fill="none" stroke-linecap="round"/>
            <path d="M200,80 L300,180" stroke="rgba(255,255,255,0.1)" stroke-width="4" fill="none" stroke-linecap="round"/>
            <!-- Layer 1 Left to Layer 2 -->
            <path d="M100,180 L50,280" stroke="rgba(255,255,255,0.1)" stroke-width="4" fill="none" stroke-linecap="round"/>
            <path d="M100,180 L150,280" stroke="rgba(255,255,255,0.1)" stroke-width="4" fill="none" stroke-linecap="round"/>
            <!-- Layer 1 Right to Layer 2 -->
            <path d="M300,180 L250,280" stroke="rgba(255,255,255,0.1)" stroke-width="4" fill="none" stroke-linecap="round"/>
            <path d="M300,180 L350,280" stroke="rgba(255,255,255,0.1)" stroke-width="4" fill="none" stroke-linecap="round"/>
            
            <!-- Dynamic Path Highlights -->
            <path id="path-active-0" d="M200,30 L200,80" stroke="rgba(255,255,255,0.4)" stroke-width="4" fill="none" stroke-linecap="round"/>
          </svg>

          <!-- Stations -->
          ${this.stations.map(st => `
            <div style="position: absolute; left: ${st.x - 20}px; top: ${st.y}px; width: 40px; height: 10px; background: ${st.color}; border-radius: 4px; box-shadow: 0 0 10px ${st.color};"></div>
          `).join('')}

          <!-- Switches -->
          ${this.switches.map(sw => `
            <div id="${sw.id}" class="tot-switch" data-state="0" style="position: absolute; left: ${sw.x - 15}px; top: ${sw.y - 15}px; width: 30px; height: 30px; background: rgba(255,255,255,0.1); border: 2px solid var(--neon-cyan); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s; font-size: 1rem; color: #fff;">
              ⬋
            </div>
          `).join('')}

          <!-- Train Container -->
          <div id="tot-trains" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;"></div>

        </div>
      </div>
    `;

    this.setRule("Hareket eden enerji partiküllerini (trenleri) MAKASLARA (O) tıklayarak KENDİ RENKLERİNDEKİ hedefe ulaştırın.");

    this.switches.forEach(sw => {
      const el = document.getElementById(sw.id);
      if (el) {
        el.addEventListener('click', () => {
          this.toggleSwitch(sw);
        });
      }
    });

    this.updateSwitchVisuals();
  }

  toggleSwitch(sw) {
    sw.state = sw.state === 0 ? 1 : 0;
    if (window.soundEngine) window.soundEngine.playClick();
    this.updateSwitchVisuals();
  }

  updateSwitchVisuals() {
    this.switches.forEach(sw => {
      const el = document.getElementById(sw.id);
      if (el) {
        el.textContent = sw.state === 0 ? '⬋' : '⬊';
        el.style.transform = sw.state === 1 ? 'scale(1.1)' : 'scale(1)';
        el.style.borderColor = sw.state === 0 ? 'var(--neon-cyan)' : 'var(--neon-magenta)';
      }
    });
  }

  scheduleSpawn() {
    if (!this.engine.isRunning) return;

    // Difficulty scaling for spawn rate
    const level = this.difficulty.getLevel();
    const minDelay = Math.max(800, 3000 - (level * 250));
    const maxDelay = Math.max(1500, 4500 - (level * 300));
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;

    this.spawnTimer = this.gameTimeout(() => {
      this.spawnTrain();
      this.scheduleSpawn();
    }, delay);
  }

  spawnTrain() {
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    const speed = this.difficulty.getLevel() < 5 ? 0.8 : 1.2 + (this.difficulty.getLevel() * 0.1);
    
    const train = {
      id: `tr-${this.trainIdCounter++}`,
      x: 200,
      y: 30,
      color: color,
      targetY: 80,
      targetX: 200,
      currentNode: 'root',
      speed: speed
    };

    this.trains.push(train);

    const container = document.getElementById('tot-trains');
    if (container) {
      const el = document.createElement('div');
      el.id = train.id;
      el.style.position = 'absolute';
      el.style.left = `${train.x - 8}px`;
      el.style.top = `${train.y - 8}px`;
      el.style.width = '16px';
      el.style.height = '16px';
      el.style.borderRadius = '50%';
      el.style.background = color;
      el.style.boxShadow = `0 0 10px ${color}`;
      el.style.transition = 'none'; // We animate manually
      container.appendChild(el);
    }
  }

  loop() {
    if (!this.engine.isRunning) return;
    this.updateTrains();
    this.animFrame = requestAnimationFrame(() => this.loop());
  }

  updateTrains() {
    for (let i = this.trains.length - 1; i >= 0; i--) {
      const t = this.trains[i];
      const el = document.getElementById(t.id);
      if (!el) continue;

      // Move towards target
      const dx = t.targetX - t.x;
      const dy = t.targetY - t.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < t.speed) {
        // Arrived at a node
        t.x = t.targetX;
        t.y = t.targetY;

        if (t.currentNode === 'root') {
          // At sw-0
          const sw0 = this.switches[0];
          t.currentNode = sw0.state === 0 ? 'sw-1' : 'sw-2';
          t.targetY = 180;
          t.targetX = sw0.state === 0 ? 100 : 300;
        } else if (t.currentNode === 'sw-1') {
          // At sw-1
          const sw1 = this.switches[1];
          t.currentNode = sw1.state === 0 ? 'st-0' : 'st-1';
          t.targetY = 280;
          t.targetX = sw1.state === 0 ? 50 : 150;
        } else if (t.currentNode === 'sw-2') {
          // At sw-2
          const sw2 = this.switches[2];
          t.currentNode = sw2.state === 0 ? 'st-2' : 'st-3';
          t.targetY = 280;
          t.targetX = sw2.state === 0 ? 250 : 350;
        } else if (t.currentNode.startsWith('st-')) {
          // Arrived at station!
          this.checkArrival(t);
          el.remove();
          this.trains.splice(i, 1);
          continue;
        }
      } else {
        // Move
        t.x += (dx / dist) * t.speed;
        t.y += (dy / dist) * t.speed;
      }

      el.style.left = `${t.x - 8}px`;
      el.style.top = `${t.y - 8}px`;
    }
  }

  checkArrival(train) {
    const stationId = train.currentNode;
    const stationIndex = parseInt(stationId.split('-')[1]);
    const station = this.stations[stationIndex];

    if (station.color === train.color) {
      this.reportSuccess(100 + Math.round(this.difficulty.getLevel() * 10));
    } else {
      this.reportError("Yanlış İstasyona Yönlendirildi!");
    }
  }

  onDestroy() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
  }
}

window.TrainOfThoughtGame = TrainOfThoughtGame;

GameRegistry.register('trainofthought', {
  name: 'Logic Router',
  subtitle: 'Tren Yönlendirme',
  description: 'Aynı anda birden fazla objeyi takip et ve makasları zamanında değiştirerek doğru istasyonlara ulaştır.',
  fullDescription: 'Bölünmüş dikkat kapasitenizi (divided attention) en üst seviyeye çıkaran yönlendirme simülasyonu. Birden fazla hedefin rotasını eşzamanlı planlayın.',
  category: 'attention',
  categoryName: 'Seçici Dikkat',
  categoryIcon: '🎯',
  categoryLabel: 'DİKKAT & ODAK',
  icon: '🛤️',
  tagClass: 'tag-magenta',
  orbClass: 'orb-chroma',
  catClass: 'cat-flex',
  tagline: '🎯 Çoklu Takip',
  difficultyLabel: 'Gittikçe Hızlanan',
  cogDimension: 'focus',
  skills: ['Bölünmüş Dikkat', 'Çoklu Görev (Multitasking)', 'Rota Planlama'],
  duration: 45,
  GameClass: TrainOfThoughtGame
});
