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
    this.renderGamesUI();

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

  this.isRunning = true;
  this.score = 0;
  this.combo = 0;
  this.maxCombo = 0;
  this.correctCount = 0;
  this.totalAttempts = 0;
  this.reactionTimes = [];
  this.timeLeft = 45;

  const gameMeta = GameRegistry.get(gameKey);

  const titleEl = document.getElementById('current-game-title');
  const modeBadge = document.getElementById('current-game-mode-badge');
  if (titleEl) titleEl.textContent = gameMeta ? `${gameMeta.name} (${gameMeta.subtitle})` : 'Nöro-Simülatör';
  if (modeBadge) {
    modeBadge.textContent = isDaily ? `GÜNLÜK PROTOKOL [${stageIdx + 1}/3]` : 'SERBEST MOD';
  }

  this.updateHUD();

  const arena = document.getElementById('game-arena');
  if (arena) arena.classList.add('active');

  // ÇARPI BUTONUNU GÖRÜNÜR YAP
  let exitBtn = document.getElementById('btn-exit-game');
  if (exitBtn) {
    exitBtn.style.display = 'flex';
    exitBtn.style.zIndex = '1001';
  }

  // ==========================================
  // KÖK ÇÖZÜM: MOUNT'U ZORLA TEMİZLE
  // ==========================================
  const mountPoint = document.getElementById('game-mount-point');
  if (mountPoint) {
    mountPoint.innerHTML = '';
  }

  const ruleText = document.getElementById('game-rule-text');
  if (ruleText) {
    ruleText.textContent = 'Kural Hazırlanıyor...';
  }

  // ÖNCEKİ OYUNU YOK ET
  if (this.activeGameInstance) {
    try {
      if (this.activeGameInstance.destroy) {
        this.activeGameInstance.destroy();
      }
    } catch (e) {
      console.error('Destroy error:', e);
    }
    this.activeGameInstance = null;
  }

  // YENİ OYUNU OLUŞTUR
  try {
    this.activeGameInstance = GameRegistry.create(gameKey, this);
    
    if (!this.activeGameInstance) {
      throw new Error(`Game "${gameKey}" could not be created`);
    }
    
    this.activeGameInstance.start();
  } catch (error) {
    console.error(`Error launching game ${gameKey}:`, error);
    alert(`Oyun başlatma hatası: ${error.message}`);
    this.exitGame();
    return;
  }

  // ESC TUŞU
  if (this._escHandler) {
    window.removeEventListener('keydown', this._escHandler);
  }
  this._escHandler = (e) => {
    if (e.key === 'Escape' && this.isRunning) {
      this.exitGame();
    }
  };
  window.addEventListener('keydown', this._escHandler);

  // TIMER
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
  
  if (this._escHandler) {
    window.removeEventListener('keydown', this._escHandler);
    this._escHandler = null;
  }
  
  if (this.activeGameInstance) {
    try {
      if (this.activeGameInstance.destroy) {
        this.activeGameInstance.destroy();
      }
    } catch (e) {
      console.error('Exit destroy error:', e);
    }
    this.activeGameInstance = null;
  }
  
  const mountPoint = document.getElementById('game-mount-point');
  if (mountPoint) {
    mountPoint.innerHTML = '';
  }
  
  const arena = document.getElementById('game-arena');
  if (arena) {
    arena.classList.remove('active');
  }
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

  /* =========================================================
     OYUNLARI ARAYÜZE YÜKLEME (YENİ EKLENDİ)
     ========================================================= */
  renderGamesUI() {
    if (typeof GameRegistry === 'undefined') return;

    // 1. Filtre butonlarını yükle
    const filterPillsContainer = document.getElementById('hub-filter-pills');
    if (filterPillsContainer) {
      filterPillsContainer.innerHTML = GameRegistry.renderFilterPills();
      const filterPills = filterPillsContainer.querySelectorAll('.pill');
      filterPills.forEach(p => {
        p.addEventListener('click', () => {
          filterPills.forEach(x => x.classList.remove('active'));
          p.classList.add('active');
          this.filterGamesHub(p.getAttribute('data-filter'));
        });
      });
    }

    // 2. Dashboard'daki öne çıkan ilk 3 oyunu yükle
    const featuredContainer = document.getElementById('featured-games-container');
    if (featuredContainer) {
      const allGames = GameRegistry.getAllKeys();
      featuredContainer.innerHTML = allGames.slice(0, 3).map(key => GameRegistry.renderFeaturedCard(key)).join('');
    }

    // 3. Oyunlar sayfasındaki tüm oyunları yükle
    const hubContainer = document.getElementById('games-hub-container');
    if (hubContainer) {
      const allGames = GameRegistry.getAllKeys();
      hubContainer.innerHTML = allGames.map(key => GameRegistry.renderHubCard(key)).join('');
    }
  }
} // <--- BU TEK SÜSLÜ PARANTEZ, class NeuroSynapseApp'ı KAPATIR. ALTINA DOKUNMA.

/* =========================================================
   OYUN KAYITLARI (CLASS'IN DIŞINDA KALMALI)
   ========================================================= */
/* =========================================================
   OYUN KAYITLARI (TÜM BİLGİLERLE)
   ========================================================= */
if (typeof GameRegistry !== 'undefined') {
  GameRegistry.register('facesnames', {
    name: 'Yüz & İsim',
    subtitle: 'Hafıza',
    description: 'Yüzleri ve isimleri eşleştir, sosyal hafızanı güçlendir.',
    fullDescription: 'İnsanların yüzlerini ve isimlerini hatırlama becerini geliştir.',
    category: 'memory',
    categoryName: 'Hafıza',
    categoryIcon: '',
    catClass: 'cat-memory',
    icon: '👤',
    orbClass: 'orb-memory',
    tagClass: 'tag-cyan',
    tagline: 'Orta',
    difficultyLabel: 'Adaptif',
    skills: ['İsim Yüz Eşleştirme', 'Sosyal Hafıza'],
    create: (app) => new FacesNamesGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('targettracker', {
    name: 'Hedef Takibi',
    subtitle: 'Dikkat',
    description: 'Hareket eden hedefleri takip et ve odaklanma gücünü artır.',
    fullDescription: 'Çoklu hedef takibi ile görsel dikkat ve konsantrasyon becerilerini geliştir.',
    category: 'attention',
    categoryName: 'Dikkat',
    categoryIcon: '🎯',
    catClass: 'cat-attention',
    icon: '🎯',
    orbClass: 'orb-focus',
    tagClass: 'tag-amber',
    tagline: 'Hızlı',
    difficultyLabel: 'Dinamik',
    skills: ['Görsel Takip', 'Odaklanma'],
    create: (app) => new TargetTrackerGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('flashreflex', {
    name: 'Işık & Refleks',
    subtitle: 'Hız',
    description: 'Ani ışık değişimlerine hızlı tepki ver.',
    fullDescription: 'Reflekslerini ve reaksiyon süreni geliştir, ışık hızında karar ver.',
    category: 'speed',
    categoryName: 'Hız',
    categoryIcon: '⚡',
    catClass: 'cat-speed',
    icon: '',
    orbClass: 'orb-speed',
    tagClass: 'tag-yellow',
    tagline: 'Süper Hızlı',
    difficultyLabel: 'Reaktif',
    skills: ['Refleks', 'Reaksiyon Süresi'],
    create: (app) => new FlashReflexGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('soundsequence', {
    name: 'Işık & Ses Sırası',
    subtitle: 'Hafıza',
    description: 'Ses ve ışık dizilerini hafızanda tut ve tekrarla.',
    fullDescription: 'İşitsel ve görsel hafızanı birlikte çalıştır, sıralı bellek kapasiteni artır.',
    category: 'memory',
    categoryName: 'Hafıza',
    categoryIcon: '',
    catClass: 'cat-memory',
    icon: '🎵',
    orbClass: 'orb-memory',
    tagClass: 'tag-cyan',
    tagline: 'Zorlu',
    difficultyLabel: 'Kademeli',
    skills: ['İşitsel Hafıza', 'Sıralı Bellek'],
    create: (app) => new SoundSequenceGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('selectivefocus', {
    name: 'Hedef İkon',
    subtitle: 'Dikkat',
    description: 'Kalabalık içinde hedef ikonu bul ve seçici dikkatini geliştir.',
    fullDescription: 'Görsel gürültü arasında spesifik hedefleri tespit etme becerini artır.',
    category: 'attention',
    categoryName: 'Dikkat',
    categoryIcon: '🎯',
    catClass: 'cat-attention',
    icon: '',
    orbClass: 'orb-focus',
    tagClass: 'tag-amber',
    tagline: 'Odaklı',
    difficultyLabel: 'Seçici',
    skills: ['Seçici Dikkat', 'Görsel Tarama'],
    create: (app) => new SelectiveFocusGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('patternburst', {
    name: 'Hızlı İkiz',
    subtitle: 'Hız',
    description: 'Aynı desenleri ışık hızında eşleştir.',
    fullDescription: 'Görsel desen tanıma ve hızlı karar verme becerilerini geliştir.',
    category: 'speed',
    categoryName: 'Hız',
    categoryIcon: '⚡',
    catClass: 'cat-speed',
    icon: '⚡',
    orbClass: 'orb-speed',
    tagClass: 'tag-yellow',
    tagline: 'Patlama',
    difficultyLabel: 'Hızlı',
    skills: ['Desen Tanıma', 'Hızlı Eşleştirme'],
    create: (app) => new PatternBurstGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('brainshift', {
    name: 'Kural Değişimi',
    subtitle: 'Esneklik',
    description: 'Değişen kurallara anında adapte ol.',
    fullDescription: 'Bilişsel esneklik ve görev değiştirme becerilerini zorla.',
    category: 'flexibility',
    categoryName: 'Esneklik',
    categoryIcon: '🔄',
    catClass: 'cat-flex',
    icon: '🔄',
    orbClass: 'orb-chroma',
    tagClass: 'tag-magenta',
    tagline: 'Esnek',
    difficultyLabel: 'Adaptif',
    skills: ['Görev Değiştirme', 'Bilişsel Esneklik'],
    create: (app) => new BrainShiftGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('colormatch', {
    name: 'Renk & Anlam',
    subtitle: 'Esneklik',
    description: 'Stroop etkisini yen, renk ve kelime anlamını ayırt et.',
    fullDescription: 'Otomatik tepkilerini bastır ve bilinçli kararlar ver.',
    category: 'flexibility',
    categoryName: 'Esneklik',
    categoryIcon: '🔄',
    catClass: 'cat-flex',
    icon: '',
    orbClass: 'orb-chroma',
    tagClass: 'tag-magenta',
    tagline: 'Karmaşık',
    difficultyLabel: 'Stroop',
    skills: ['İnhibitör Kontrol', 'Seçici Dikkat'],
    create: (app) => new ColorMatchGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('pathfinder', {
    name: 'Labirent',
    subtitle: 'Problem Çözme',
    description: 'Karmaşık labirentlerde yolunu bul.',
    fullDescription: 'Uzamsal planlama ve problem çözme becerilerini geliştir.',
    category: 'problem',
    categoryName: 'Problem Çözme',
    categoryIcon: '🧩',
    catClass: 'cat-problem',
    icon: '🧭',
    orbClass: 'orb-quantum',
    tagClass: 'tag-purple',
    tagline: 'Stratejik',
    difficultyLabel: 'Planlama',
    skills: ['Uzamsal Planlama', 'Yol Bulma'],
    create: (app) => new PathfinderGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('balancescale', {
    name: 'Terazi Mantığı',
    subtitle: 'Problem Çözme',
    description: 'Terazi mantığıyla ağırlık dengesi kur.',
    fullDescription: 'Matematiksel mantık ve denge problemlerini çöz.',
    category: 'problem',
    categoryName: 'Problem Çözme',
    categoryIcon: '🧩',
    catClass: 'cat-problem',
    icon: '⚖️',
    orbClass: 'orb-quantum',
    tagClass: 'tag-purple',
    tagline: 'Mantıklı',
    difficultyLabel: 'Analitik',
    skills: ['Matematiksel Mantık', 'Denge'],
    create: (app) => new BalanceScaleGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('chalkboard', {
    name: 'İşlem Karşılaştırma',
    subtitle: 'Matematik',
    description: 'Matematiksel işlemleri karşılaştır ve doğru kararı ver.',
    fullDescription: 'Mental aritmetik ve sayısal karşılaştırma becerilerini geliştir.',
    category: 'math',
    categoryName: 'Matematik',
    categoryIcon: '🔢',
    catClass: 'cat-math',
    icon: '📐',
    orbClass: 'orb-logic',
    tagClass: 'tag-blue',
    tagline: 'Sayısal',
    difficultyLabel: 'Hesaplı',
    skills: ['Mental Aritmetik', 'Karşılaştırma'],
    create: (app) => new ChalkboardGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('wordbubbles', {
    name: 'Kelime Türetme',
    subtitle: 'Dil',
    description: 'Harflerden kelimeler türet, sözcük dağarcığını genişlet.',
    fullDescription: 'Dil becerileri ve kelime hazineni geliştir.',
    category: 'language',
    categoryName: 'Dil',
    categoryIcon: '📝',
    catClass: 'cat-language',
    icon: '',
    orbClass: 'orb-verbal',
    tagClass: 'tag-green',
    tagline: 'Kelime',
    difficultyLabel: 'Sözcük',
    skills: ['Kelime Bilgisi', 'Dil Becerileri'],
    create: (app) => new WordBubblesGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('numbercascade', {
    name: 'Hedef Toplam',
    subtitle: 'Matematik',
    description: 'Sayıları birleştirerek hedef toplama ulaş.',
    fullDescription: 'Sayısal strateji ve mental hesaplama becerilerini geliştir.',
    category: 'math',
    categoryName: 'Matematik',
    categoryIcon: '🔢',
    catClass: 'cat-math',
    icon: '🔢',
    orbClass: 'orb-logic',
    tagClass: 'tag-blue',
    tagline: 'Toplama',
    difficultyLabel: 'Stratejik',
    skills: ['Sayısal Strateji', 'Hesaplama'],
    create: (app) => new NumberCascadeGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('spatialspeedmatch', {
    name: 'Uzamsal Hız',
    subtitle: 'Hafıza',
    description: 'Uzamsal desenleri hızlıca eşleştir.',
    fullDescription: 'Görsel-uzamsal hafıza ve hız becerilerini birlikte çalıştır.',
    category: 'memory',
    categoryName: 'Hafıza',
    categoryIcon: '🧠',
    catClass: 'cat-memory',
    icon: '🧊',
    orbClass: 'orb-memory',
    tagClass: 'tag-cyan',
    tagline: 'Uzamsal',
    difficultyLabel: 'Hızlı',
    skills: ['Uzamsal Hafıza', 'Görsel Hız'],
    create: (app) => new SpatialSpeedMatchGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('peripheralvision', {
    name: 'Çevresel Görüş',
    subtitle: 'Dikkat',
    description: 'Çevresel görüşünü kullanarak hedefleri tespit et.',
    fullDescription: 'Görsel algı alanını genişlet ve çevresel farkındalığını artır.',
    category: 'attention',
    categoryName: 'Dikkat',
    categoryIcon: '🎯',
    catClass: 'cat-attention',
    icon: '👁️',
    orbClass: 'orb-focus',
    tagClass: 'tag-amber',
    tagline: 'Geniş',
    difficultyLabel: 'Algı',
    skills: ['Çevresel Görüş', 'Görsel Algı'],
    create: (app) => new PeripheralVisionGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('rhythmtap', {
    name: 'Ritim & Zamanlama',
    subtitle: 'Hız',
    description: 'Ritmik desenleri takip et ve zamanlamayı yakala.',
    fullDescription: 'İşitsel-motor koordinasyon ve zamanlama becerilerini geliştir.',
    category: 'speed',
    categoryName: 'Hız',
    categoryIcon: '⚡',
    catClass: 'cat-speed',
    icon: '🥁',
    orbClass: 'orb-speed',
    tagClass: 'tag-yellow',
    tagline: 'Ritmik',
    difficultyLabel: 'Zamanlı',
    skills: ['Ritim', 'Zamanlama', 'Koordinasyon'],
    create: (app) => new RhythmTapGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('disjointedrules', {
    name: 'Değişken Kural',
    subtitle: 'Esneklik',
    description: 'Sürekli değişen kurallara adapte ol.',
    fullDescription: 'Bilişsel esneklik ve kural değişimi adaptasyonunu zorla.',
    category: 'flexibility',
    categoryName: 'Esneklik',
    categoryIcon: '🔄',
    catClass: 'cat-flex',
    icon: '🎭',
    orbClass: 'orb-chroma',
    tagClass: 'tag-magenta',
    tagline: 'Değişken',
    difficultyLabel: 'Karmaşık',
    skills: ['Kural Değiştirme', 'Adaptasyon'],
    create: (app) => new DisjointedRulesGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('towerlogic', {
    name: 'Kule Dizilimi',
    subtitle: 'Problem Çözme',
    description: 'Kuleleri mantıklı şekilde diz, strateji kur.',
    fullDescription: 'Sıralı problem çözme ve stratejik planlama becerilerini geliştir.',
    category: 'problem',
    categoryName: 'Problem Çözme',
    categoryIcon: '🧩',
    catClass: 'cat-problem',
    icon: '🗼',
    orbClass: 'orb-quantum',
    tagClass: 'tag-purple',
    tagline: 'Kule',
    difficultyLabel: 'Stratejik',
    skills: ['Planlama', 'Mantık'],
    create: (app) => new TowerLogicGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('spatialrotation', {
    name: '3D Döndürme',
    subtitle: 'Problem Çözme',
    description: '3D nesneleri zihninde döndür ve uzamsal muhakeme gücünü test et.',
    fullDescription: 'Karmaşık 3D yapıları zihninde manipüle ederek uzamsal zekânı geliştir.',
    category: 'problem',
    categoryName: 'Problem Çözme',
    categoryIcon: '🧩',
    catClass: 'cat-problem',
    icon: '',
    orbClass: 'orb-quantum',
    tagClass: 'tag-purple',
    tagline: 'Zorlu',
    difficultyLabel: 'İleri Seviye',
    skills: ['Uzamsal Muhakeme', '3D Görselleştirme', 'Mental Rotasyon'],
    create: (app) => new SpatialRotationGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  GameRegistry.register('anagramburst', {
    name: 'Hızlı Anagram',
    subtitle: 'Dil',
    description: 'Karışık harflerden hızla kelime oluştur.',
    fullDescription: 'Kelime türetme ve dil işleme hızını artır.',
    category: 'language',
    categoryName: 'Dil',
    categoryIcon: '📝',
    catClass: 'cat-language',
    icon: '',
    orbClass: 'orb-verbal',
    tagClass: 'tag-green',
    tagline: 'Anagram',
    difficultyLabel: 'Hızlı',
    skills: ['Kelime Oluşturma', 'Dil Hızı'],
    create: (app) => new AnagramBurstGame(document.getElementById('game-arena') || document.body, { onGameOver: (s) => app.endGame(), onScore: (s) => app.onSuccess(s), playSound: () => window.soundEngine && window.soundEngine.playClick() })
  });

  if (typeof GameRegistry !== 'undefined') {
  GameRegistry.register('neuralnetwork', {
    name: 'Nöral Ağ Kurucusu',
    subtitle: 'Özgün Oyun',
    description: 'Düğümleri bağlayarak sinir ağı oluştur.',
    fullDescription: 'Nöron bağlantılarını kur, ağ topolojisini optimize et.',
    category: 'unique',
    categoryName: 'Özgün',
    categoryIcon: '⚛️',
    catClass: 'cat-unique',
    icon: '🕸️',
    orbClass: 'orb-quantum',
    tagClass: 'tag-rainbow',
    tagline: 'Nöral',
    difficultyLabel: 'Karmaşık',
    skills: ['Ağ Optimizasyonu', 'Bağlantı Mantığı'],
    GameClass: NeuralNetworkGame
  });

  GameRegistry.register('emotiondecoder', {
    name: 'Duygu Kod Çözücü',
    subtitle: 'Özgün Oyun',
    description: 'Karışık yüz ifadelerini oku.',
    fullDescription: 'Mikro duyguları ayırt et, duygusal zekânı geliştir.',
    category: 'unique',
    categoryName: 'Özgün',
    categoryIcon: '🎭',
    catClass: 'cat-unique',
    icon: '🎭',
    orbClass: 'orb-quantum',
    tagClass: 'tag-rainbow',
    tagline: 'Duygusal',
    difficultyLabel: 'Hassas',
    skills: ['Duygu Okuma', 'Empati'],
    GameClass: EmotionDecoderGame
  });

  GameRegistry.register('timedilation', {
    name: 'Zaman Genişlemesi',
    subtitle: 'Özgün Oyun',
    description: 'Farklı hızlarda akan zamanı sırala.',
    fullDescription: 'Zaman algısını test et, olayları doğru sıraya koy.',
    category: 'unique',
    categoryName: 'Özgün',
    categoryIcon: '',
    catClass: 'cat-unique',
    icon: '⏳',
    orbClass: 'orb-quantum',
    tagClass: 'tag-rainbow',
    tagline: 'Zamansal',
    difficultyLabel: 'Göreceli',
    skills: ['Zaman Algısı', 'Sıralama'],
    GameClass: TimeDilationGame
  });

  GameRegistry.register('synesthesia', {
    name: 'Sinestezi Testi',
    subtitle: 'Özgün Oyun',
    description: 'Sesleri renklere eşleştir.',
    fullDescription: 'Çapraz duyusal algı, sinestezi benzeri deneyim.',
    category: 'unique',
    categoryName: 'Özgün',
    categoryIcon: '🎨',
    catClass: 'cat-unique',
    icon: '🎨',
    orbClass: 'orb-quantum',
    tagClass: 'tag-rainbow',
    tagline: 'Çapraz',
    difficultyLabel: 'Algısal',
    skills: ['Çapraz Algı', 'Duyusal Eşleştirme'],
    GameClass: SynesthesiaGame
  });

  GameRegistry.register('chaostheory', {
    name: 'Kaos Teorisi',
    subtitle: 'Özgün Oyun',
    description: 'Kelebek etkisini tahmin et.',
    fullDescription: 'Küçük değişikliklerin büyük sonuçlarını öngör.',
    category: 'unique',
    categoryName: 'Özgün',
    categoryIcon: '🦋',
    catClass: 'cat-unique',
    icon: '',
    orbClass: 'orb-quantum',
    tagClass: 'tag-rainbow',
    tagline: 'Kaotik',
    difficultyLabel: 'Tahmin',
    skills: ['Nedensellik', 'Tahmin'],
    GameClass: ChaosTheoryGame
  });

  GameRegistry.register('dreamlogic', {
    name: 'Rüya Mantığı',
    subtitle: 'Özgün Oyun',
    description: 'Absürt senaryolarda doğru kararı bul.',
    fullDescription: 'Normal mantığın çalışmadığı rüya dünyasında düşün.',
    category: 'unique',
    categoryName: 'Özgün',
    categoryIcon: '💭',
    catClass: 'cat-unique',
    icon: '💭',
    orbClass: 'orb-quantum',
    tagClass: 'tag-rainbow',
    tagline: 'Sürreal',
    difficultyLabel: 'Absürt',
    skills: ['Yaratıcı Düşünme', 'Esneklik'],
    GameClass: DreamLogicGame
  });

  GameRegistry.register('quantumentanglement', {
    name: 'Kuantum Dolanıklık',
    subtitle: 'Özgün Oyun',
    description: 'Dolanık parçacık çiftlerini bul.',
    fullDescription: 'Kuantum mekaniğinin en garip fenomenini deneyimle.',
    category: 'unique',
    categoryName: 'Özgün',
    categoryIcon: '⚛️',
    catClass: 'cat-unique',
    icon: '⚛️',
    orbClass: 'orb-quantum',
    tagClass: 'tag-rainbow',
    tagline: 'Kuantum',
    difficultyLabel: 'Fizik',
    skills: ['Kuantum Mantık', 'İlişki Analizi'],
    GameClass: QuantumEntanglementGame
  });
GameRegistry.register('moralcompass', {
    name: 'Ahlaki Pusula',
    subtitle: 'Özgün Oyun',
    description: 'Hızlı ahlaki ikilemlere karar ver.',
    fullDescription: 'Etik muhakeme ve tutarlılık becerilerini test et.',
    category: 'unique',
    categoryName: 'Özgün',
    categoryIcon: '⚖️',
    catClass: 'cat-unique',
    icon: '⚖️',
    orbClass: 'orb-quantum',
    tagClass: 'tag-rainbow',
    tagline: 'Etik',
    difficultyLabel: 'Felsefi',
    skills: ['Ahlaki Muhakeme', 'Karar Tutarlılığı'],
    GameClass: MoralCompassGame
  });
}

// =========================================================
// UYGULAMAYI BAŞLAT
// =========================================================
window.app = new NeuroSynapseApp();
}