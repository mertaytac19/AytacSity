/**
 * NEUROSYNAPSE - Master Application Orchestrator
 * Neural Particle Canvas, Game Lifecycle Engine, View Router & Daily Protocol.
 */

class NeuroSynapseApp {
  constructor() {
    this.currentView = 'dashboard';
    this.activeGameInstance = null;
    this.activeGameKey = null;
    this.isDailyMode = false;
    this.dailyStageIndex = 0;
    this.dailySequence = ['chromashift', 'synapselink', 'echomatrix'];

    // Game runtime state
    this.isRunning = false;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.correctCount = 0;
    this.totalAttempts = 0;
    this.reactionTimes = [];
    this.timeLeft = 45;
    this.gameInterval = null;

    this.init();
  }

  init() {
    this.initBackgroundParticles();
    this.initNavigation();
    this.initAudioButtons();
    this.initSummaryModal();
    this.initDailyProtocolUI();

    // Start on dashboard and refresh analytics
    if (window.analytics) {
      window.analytics.updateUI();
    }

    // Quick calibration button
    const calibBtn = document.getElementById('btn-calibrate-test');
    if (calibBtn) {
      calibBtn.addEventListener('click', () => this.launchGame('chromashift'));
    }

    const startDailyBtn = document.getElementById('btn-start-daily');
    if (startDailyBtn) {
      startDailyBtn.addEventListener('click', () => this.startDailyStage(0));
    }

    const exitGameBtn = document.getElementById('btn-exit-game');
    if (exitGameBtn) {
      exitGameBtn.addEventListener('click', () => this.exitGame());
    }

    // Global ESC key listener to exit modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isRunning) {
        this.exitGame();
      }
    });

    // Filter pills on games hub
    const filterPills = document.querySelectorAll('.filter-pills .pill');
    filterPills.forEach(p => {
      p.addEventListener('click', () => {
        filterPills.forEach(x => x.classList.remove('active'));
        p.classList.add('active');
        const filter = p.getAttribute('data-filter');
        this.filterGamesHub(filter);
      });
    });
  }

  /* =========================================================
     NAVIGATION & VIEWS
     ========================================================= */
  initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        const targetView = link.getAttribute('data-view');
        this.navigate(targetView);
      });
    });
  }

  navigate(viewId) {
    if (window.soundEngine) window.soundEngine.playClick();
    this.currentView = viewId;

    // Update nav links active state
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('data-view') === viewId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update view container active state
    document.querySelectorAll('.view').forEach(view => {
      if (view.id === `view-${viewId}`) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    // Redraw charts if entering analytics or dashboard
    if (window.analytics) {
      window.analytics.updateUI();
    }
  }

  filterGamesHub(category) {
    const cards = document.querySelectorAll('.hub-game-card');
    cards.forEach(card => {
      if (category === 'all' || card.getAttribute('data-category') === category) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  /* =========================================================
     AUDIO CONTROLLER BINDINGS
     ========================================================= */
  initAudioButtons() {
    const binBtn = document.getElementById('btn-toggle-binaural');
    const sfxBtn = document.getElementById('btn-toggle-sfx');

    if (binBtn) {
      binBtn.addEventListener('click', () => {
        const active = window.soundEngine.toggleBinaural();
        binBtn.classList.toggle('active', active);
        binBtn.querySelector('.btn-label').textContent = active ? 'Binaural: Aktif' : 'Binaural Ses';
      });
    }

    if (sfxBtn) {
      sfxBtn.addEventListener('click', () => {
        const active = window.soundEngine.toggleSFX();
        sfxBtn.classList.toggle('active', active);
        sfxBtn.querySelector('.btn-label').textContent = active ? 'SFX: Açık' : 'SFX: Kapalı';
      });
    }
  }

  /* =========================================================
     GAME LIFECYCLE & RUNTIME ENGINE
     ========================================================= */
  launchGame(gameKey, isDaily = false, stageIdx = 0) {
    if (window.soundEngine) {
      window.soundEngine.init();
      window.soundEngine.playClick();
    }

    this.activeGameKey = gameKey;
    this.isDailyMode = isDaily;
    this.dailyStageIndex = stageIdx;

    // Reset Runtime Stats
    this.isRunning = true;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.correctCount = 0;
    this.totalAttempts = 0;
    this.reactionTimes = [];
    this.timeLeft = 45; // 45 seconds per brain session

    // Get Meta from Registry
    const gameMeta = GameRegistry.get(gameKey);

    const titleEl = document.getElementById('current-game-title');
    const modeBadge = document.getElementById('current-game-mode-badge');
    if (titleEl) titleEl.textContent = gameMeta ? `${gameMeta.name} (${gameMeta.subtitle})` : 'Nöro-Simülatör';
    if (modeBadge) {
      modeBadge.textContent = isDaily ? `GÜNLÜK PROTOKOL [${stageIdx + 1}/3]` : 'SERBEST MOD';
    }

    this.updateHUD();

    // Open Modal Arena
    const arena = document.getElementById('game-arena');
    if (arena) arena.classList.add('active');

    // Instantiate specific game class
    if (this.activeGameInstance && this.activeGameInstance.destroy) {
      this.activeGameInstance.destroy();
    }

    // Use GameRegistry to instantiate
    this.activeGameInstance = GameRegistry.create(gameKey, this);

    this.activeGameInstance.start();

    // Start Countdown Timer
    clearInterval(this.gameInterval);
    this.gameInterval = setInterval(() => {
      this.timeLeft--;
      this.updateHUD();
      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);
  }

  onSuccess(points = 100, reactionTimeMs = 0) {
    if (!this.isRunning) return;
    this.totalAttempts++;
    this.correctCount++;
    this.combo++;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;
    this.score += points;

    if (reactionTimeMs > 0) {
      this.reactionTimes.push(reactionTimeMs);
    }

    if (window.soundEngine) {
      window.soundEngine.playCorrect(this.combo);
    }

    this.updateHUD();
  }

  onError(reason = "") {
    if (!this.isRunning) return;
    this.totalAttempts++;
    this.combo = 0;

    if (window.soundEngine) {
      window.soundEngine.playError();
    }

    // Micro shake game arena
    const arena = document.querySelector('.game-container');
    if (arena) {
      arena.style.transform = 'translate(-4px, 2px)';
      setTimeout(() => arena.style.transform = 'translate(4px, -2px)', 50);
      setTimeout(() => arena.style.transform = 'none', 100);
    }

    this.updateHUD();
  }

  updateHUD() {
    const timerEl = document.getElementById('game-timer');
    const scoreEl = document.getElementById('game-score');
    const comboEl = document.getElementById('game-combo');
    const accEl = document.getElementById('game-accuracy');

    if (timerEl) timerEl.textContent = `${this.timeLeft}s`;
    if (scoreEl) scoreEl.textContent = this.score.toLocaleString();
    if (comboEl) comboEl.textContent = `x${this.combo}`;

    const acc = this.totalAttempts > 0 ? Math.round((this.correctCount / this.totalAttempts) * 100) : 100;
    if (accEl) accEl.textContent = `${acc}%`;
  }

  endGame() {
    this.isRunning = false;
    clearInterval(this.gameInterval);

    if (this.activeGameInstance && this.activeGameInstance.destroy) {
      this.activeGameInstance.destroy();
    }

    // Close Arena Modal
    const arena = document.getElementById('game-arena');
    if (arena) arena.classList.remove('active');

    // Compute metrics
    const acc = this.totalAttempts > 0 ? Math.round((this.correctCount / this.totalAttempts) * 100) : 100;
    const avgReaction = this.reactionTimes.length > 0
      ? Math.round(this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length)
      : 360;

    const gameResult = {
      score: this.score,
      accuracy: acc,
      maxCombo: this.maxCombo,
      avgReactionTime: avgReaction
    };

    // Record in cognitive analytics
    if (window.analytics) {
      window.analytics.recordGameSession(this.activeGameKey, gameResult);
    }

    // Check Daily Stage Progression
    if (this.isDailyMode) {
      window.analytics.data.dailyStagesDone[this.dailyStageIndex] = true;
      window.analytics.saveData();
      this.initDailyProtocolUI();
    }

    // Show Summary Modal
    this.showSummaryModal(gameResult);
  }

  exitGame() {
    this.isRunning = false;
    clearInterval(this.gameInterval);
    if (this.activeGameInstance && this.activeGameInstance.destroy) {
      this.activeGameInstance.destroy();
    }
    const arena = document.getElementById('game-arena');
    if (arena) arena.classList.remove('active');
  }

  /* =========================================================
     SUMMARY MODAL & INSIGHT GENERATOR
     ========================================================= */
  initSummaryModal() {
    const replayBtn = document.getElementById('btn-summary-replay');
    const contBtn = document.getElementById('btn-summary-continue');
    const modal = document.getElementById('modal-summary');

    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        if (modal) modal.classList.remove('active');
        this.launchGame(this.activeGameKey, this.isDailyMode, this.dailyStageIndex);
      });
    }

    if (contBtn) {
      contBtn.addEventListener('click', () => {
        if (modal) modal.classList.remove('active');
        if (this.isDailyMode && this.dailyStageIndex < 2) {
          // Auto advance to next stage
          this.startDailyStage(this.dailyStageIndex + 1);
        } else {
          this.navigate('analytics');
        }
      });
    }
  }

  showSummaryModal(result) {
    const modal = document.getElementById('modal-summary');
    if (!modal) return;

    const titleEl = document.getElementById('summary-game-name');
    const scoreEl = document.getElementById('summary-final-score');
    const accEl = document.getElementById('summary-accuracy');
    const comboEl = document.getElementById('summary-combo');
    const reactEl = document.getElementById('summary-reaction');
    const boostEl = document.getElementById('summary-boost');
    const insightsEl = document.getElementById('summary-insights-text');

    if (titleEl) titleEl.textContent = `${this.activeGameKey.toUpperCase()} // Bilişsel Seans Raporu`;
    if (scoreEl) scoreEl.textContent = result.score.toLocaleString();
    if (accEl) accEl.textContent = `${result.accuracy}%`;
    if (comboEl) comboEl.textContent = `${result.maxCombo}x`;
    if (reactEl) reactEl.textContent = `${result.avgReactionTime}ms`;

    const boostVal = Math.round((result.score / 200) + (result.maxCombo * 1.5));
    if (boostEl) boostEl.textContent = `+${boostVal} BPI`;

    // Dynamic Cognitive Insight Generation
    let insight = "Harika bir zihinsel antrenman oturumu tamamladınız!";
    if (result.accuracy >= 90) {
      insight = "🌟 Kusursuz Odaklanma: Beyninizin ön lobundaki prefrontal korteks aktivasyonu tepe noktasına ulaştı!";
    } else if (result.avgReactionTime < 350) {
      insight = "⚡ Işık Hızı Tepki: Sinaptik iletim hızınız ortalama insan refleksinin %35 üzerinde ölçüldü.";
    } else {
      insight = "💡 Nöronal Adaptasyon: Kural değişimlerine gösterdiğiniz esneklik bilişsel rezervinizi güçlendiriyor.";
    }

    if (insightsEl) insightsEl.textContent = insight;

    modal.classList.add('active');
    if (window.soundEngine) window.soundEngine.playLevelUp();
  }

  /* =========================================================
     DAILY PROTOCOL FLOW
     ========================================================= */
  initDailyProtocolUI() {
    const stages = [
      document.getElementById('stage-1-card'),
      document.getElementById('stage-2-card'),
      document.getElementById('stage-3-card')
    ];

    const doneArr = (window.analytics && window.analytics.data.dailyStagesDone) || [false, false, false];

    stages.forEach((card, idx) => {
      if (!card) return;
      const btn = card.querySelector('.stage-btn');
      const status = card.querySelector('.stage-status');

      if (doneArr[idx]) {
        card.classList.remove('locked');
        card.classList.add('completed');
        if (status) {
          status.className = 'stage-status status-done';
          status.textContent = '✔ Tamamlandı';
        }
        if (btn) {
          btn.className = 'stage-btn';
          btn.disabled = false;
          btn.textContent = 'Tekrar Oyna';
          btn.onclick = () => this.startDailyStage(idx);
        }
      } else if (idx === 0 || doneArr[idx - 1]) {
        // Ready stage
        card.classList.remove('locked');
        if (status) {
          status.className = 'stage-status status-ready';
          status.textContent = '⚡ Hazır - Başla';
        }
        if (btn) {
          btn.className = 'stage-btn';
          btn.disabled = false;
          btn.textContent = `Aşama ${idx + 1} Başlat`;
          btn.onclick = () => this.startDailyStage(idx);
        }
      } else {
        // Locked
        card.classList.add('locked');
        if (status) {
          status.className = 'stage-status status-locked';
          status.textContent = `Aşama ${idx} Tamamlanınca Açılır`;
        }
        if (btn) {
          btn.className = 'stage-btn disabled';
          btn.disabled = true;
          btn.textContent = 'Kilitli';
        }
      }
    });
  }

  startDailyStage(stageIdx) {
    const gameKey = this.dailySequence[stageIdx] || 'chromashift';
    this.launchGame(gameKey, true, stageIdx);
  }

  /* =========================================================
     BACKGROUND NEURAL SIMULATION CANVAS
     ========================================================= */
  initBackgroundParticles() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const numParticles = Math.min(60, Math.floor((width * height) / 22000));

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2 + 1.2,
        color: Math.random() > 0.4 ? '#00f0ff' : '#b026ff'
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw Connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.18 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw and Update Particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      requestAnimationFrame(render);
    };

    render();
  }

}
/* =========================================================
   YENİ OYUN KAYITLARI (PAKET 3)
   ========================================================= */
if (typeof GameRegistry !== 'undefined') {
  GameRegistry.register('facesnames', {
    name: 'Yüz & İsim Eşleştirme',
    subtitle: 'Hafıza',
    create: (app) => new FacesNamesGame(document.getElementById('game-arena') || document.body, {
      onGameOver: (score) => app.endGame(),
      onScore: (score) => app.onSuccess(score),
      playSound: () => window.soundEngine && window.soundEngine.playClick()
    })
  });

  GameRegistry.register('targettracker', {
    name: 'Hedef Takibi',
    subtitle: 'Dikkat',
    create: (app) => new TargetTrackerGame(document.getElementById('game-arena') || document.body, {
      onGameOver: (score) => app.endGame(),
      onScore: (score) => app.onSuccess(score),
      playSound: () => window.soundEngine && window.soundEngine.playClick()
    })
  });

  GameRegistry.register('flashreflex', {
    name: 'Işık & Refleks',
    subtitle: 'Hız',
    create: (app) => new FlashReflexGame(document.getElementById('game-arena') || document.body, {
      onGameOver: (score) => app.endGame(),
      onScore: (score) => app.onSuccess(score),
      playSound: () => window.soundEngine && window.soundEngine.playClick()
    })
  });
}/* =========================================================
   YENİ OYUN KAYITLARI (10'LU PAKET)
   ========================================================= */
if (typeof GameRegistry !== 'undefined') {
  GameRegistry.register('soundsequence', {
    name: 'Işık & Ses Sırası', subtitle: 'Hafıza',
    create: (app) => new SoundSequenceGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('selectivefocus', {
    name: 'Hedef İkon', subtitle: 'Dikkat',
    create: (app) => new SelectiveFocusGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('patternburst', {
    name: 'Hızlı İkiz', subtitle: 'Hız',
    create: (app) => new PatternBurstGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('brainshift', {
    name: 'Kural Değişimi', subtitle: 'Esneklik',
    create: (app) => new BrainShiftGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('colormatch', {
    name: 'Renk & Anlam', subtitle: 'Esneklik',
    create: (app) => new ColorMatchGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('pathfinder', {
    name: 'Labirent', subtitle: 'Problem Çözme',
    create: (app) => new PathfinderGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('balancescale', {
    name: 'Terazi Mantığı', subtitle: 'Problem Çözme',
    create: (app) => new BalanceScaleGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('chalkboard', {
    name: 'İşlem Karşılaştırma', subtitle: 'Matematik',
    create: (app) => new ChalkboardGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('wordbubbles', {
    name: 'Kelime Türetme', subtitle: 'Dil',
    create: (app) => new WordBubblesGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('numbercascade', {
    name: 'Hedef Toplam', subtitle: 'Matematik',
    create: (app) => new NumberCascadeGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });
}
/* =========================================================
   SON KALAN OYUN KAYITLARI
   ========================================================= */
if (typeof GameRegistry !== 'undefined') {
  GameRegistry.register('spatialspeedmatch', {
    name: 'Uzamsal Hız', subtitle: 'Hafıza',
    create: (app) => new SpatialSpeedMatchGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('peripheralvision', {
    name: 'Çevresel Görüş', subtitle: 'Dikkat',
    create: (app) => new PeripheralVisionGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('rhythmtap', {
    name: 'Ritim & Zamanlama', subtitle: 'Hız',
    create: (app) => new RhythmTapGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('disjointedrules', {
    name: 'Değişken Kural', subtitle: 'Esneklik',
    create: (app) => new DisjointedRulesGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('towerlogic', {
    name: 'Kule Dizilimi', subtitle: 'Problem Çözme',
    create: (app) => new TowerLogicGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('spatialrotation', {
    name: '3D Döndürme', subtitle: 'Problem Çözme',
    create: (app) => new SpatialRotationGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('anagramburst', {
    name: 'Hızlı Anagram', subtitle: 'Dil',
    create: (app) => new AnagramBurstGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('quantumgrid', {
    name: 'Kuantum Şebeke', subtitle: 'Özgün Oyun',
    create: (app) => new QuantumGridGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });
}