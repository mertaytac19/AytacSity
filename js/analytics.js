/**
 * NEUROSYNAPSE - Cognitive Analytics & Neural Radar Visualizer
 * Tracks 5-dimensional brain performance, calculates BPI, and renders canvas radar charts.
 */

class CognitiveAnalytics {
  constructor() {
    this.storageKey = 'neurosynapse_user_data_v1';
    this.data = this.loadData();
    this.badges = [
      { id: 'first_spark', icon: '⚡', name: 'İlk Kıvılcım', desc: 'İlk simülasyonu başarıyla tamamladınız.', unlocked: false },
      { id: 'light_speed', icon: '🏎️', name: 'Işık Hızı Refleks', desc: '350ms altında ortalama tepki süresi.', unlocked: false },
      { id: 'master_combo', icon: '🔥', name: 'Sinaptik Akış', desc: '10x üzeri kombo serisi yakaladınız.', unlocked: false },
      { id: 'pure_accuracy', icon: '🎯', name: 'Kusursuz Odak', desc: '%95 üzeri doğrulukla seans tamamladınız.', unlocked: false },
      { id: 'daily_champion', icon: '🏆', name: 'Protokol Şampiyonu', desc: 'Günün tüm aşamalarını başarıyla bitirdiniz.', unlocked: false },
      { id: 'quantum_mind', icon: '🧠', name: 'Kuantum Zihin', desc: '1,500 üzeri Nöro-Skor seviyesine ulaştınız.', unlocked: false }
    ];
    this.checkBadges();
  }

  getDefaultData() {
    return {
      neuroScore: 1240,
      streak: 1,
      lastPlayedDate: new Date().toDateString(),
      dailyStagesDone: [false, false, false],
      scores: {
        flexibility: 82,
        spatial: 76,
        memory: 88,
        speed: 84,
        focus: 86
      },
      history: [],
      gamesPlayed: 0
    };
  }

  loadData() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Streak verification
        const today = new Date().toDateString();
        if (parsed.lastPlayedDate !== today) {
          // Check if yesterday or older
          const lastDate = new Date(parsed.lastPlayedDate);
          const diffDays = Math.round((new Date() - lastDate) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            // Consecutive day
            parsed.dailyStagesDone = [false, false, false];
          } else if (diffDays > 1) {
            // Broken streak
            parsed.streak = 1;
            parsed.dailyStagesDone = [false, false, false];
          }
          parsed.lastPlayedDate = today;
        }
        return parsed;
      }
    } catch (e) {
      console.warn("Storage load failed, using defaults:", e);
    }
    return this.getDefaultData();
  }

  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {}
  }

  recordGameSession(gameKey, result) {
    this.data.gamesPlayed++;
    const { score, accuracy, maxCombo, avgReactionTime } = result;

    // Weight dimension updates
    let dim = 'focus';
    if (gameKey === 'chromashift') dim = 'flexibility';
    else if (gameKey === 'synapselink') dim = 'spatial';
    else if (gameKey === 'echomatrix') dim = 'memory';
    else if (gameKey === 'temporalspeed') dim = 'speed';

    const normalizedPerformance = Math.min(100, Math.round((score / 2500) * 100 * (accuracy / 100)));
    this.data.scores[dim] = Math.round(this.data.scores[dim] * 0.8 + normalizedPerformance * 0.2);
    this.data.scores.focus = Math.round(this.data.scores.focus * 0.85 + accuracy * 0.15);

    // Calculate total neuroScore
    const totalDimAvg = Object.values(this.data.scores).reduce((a, b) => a + b, 0) / 5;
    this.data.neuroScore = Math.round(totalDimAvg * 18 + this.data.gamesPlayed * 15);

    this.data.history.push({
      date: new Date().toISOString(),
      game: gameKey,
      score,
      accuracy,
      maxCombo,
      avgReactionTime
    });

    this.checkBadges(result);
    this.saveData();
    this.updateUI();
  }

  checkBadges(latestResult = null) {
    if (this.data.gamesPlayed >= 1) this.unlockBadge('first_spark');
    if (this.data.neuroScore >= 1500) this.unlockBadge('quantum_mind');
    if (this.data.dailyStagesDone && this.data.dailyStagesDone.every(Boolean)) this.unlockBadge('daily_champion');

    if (latestResult) {
      if (latestResult.avgReactionTime > 0 && latestResult.avgReactionTime <= 380) this.unlockBadge('light_speed');
      if (latestResult.maxCombo >= 8) this.unlockBadge('master_combo');
      if (latestResult.accuracy >= 95) this.unlockBadge('pure_accuracy');
    }
  }

  unlockBadge(badgeId) {
    const b = this.badges.find(x => x.id === badgeId);
    if (b && !b.unlocked) {
      b.unlocked = true;
      if (window.soundEngine) window.soundEngine.playLevelUp();
    }
  }

  getBrainAge() {
    const avg = Object.values(this.data.scores).reduce((a, b) => a + b, 0) / 5;
    // Map score (60 - 100) -> Brain age (45 down to 19)
    const age = Math.round(55 - (avg / 100) * 36);
    return Math.max(18, Math.min(60, age));
  }

  updateUI() {
    const streakEl = document.getElementById('hud-streak');
    const scoreEl = document.getElementById('hud-neuro-score');
    const levelEl = document.getElementById('hud-level');
    
    if (streakEl) streakEl.textContent = `🔥 ${this.data.streak} Gün`;
    if (scoreEl) scoreEl.textContent = this.data.neuroScore.toLocaleString();
    
    if (levelEl) {
      if (this.data.neuroScore > 2000) levelEl.textContent = "Kuantum Üstat";
      else if (this.data.neuroScore > 1400) levelEl.textContent = "Kuantum Zihin";
      else if (this.data.neuroScore > 800) levelEl.textContent = "Sinaptik Mimar";
      else levelEl.textContent = "Çırak Araştırmacı";
    }

    // Analytics view specific
    const bpiEl = document.getElementById('calc-bpi');
    const ageEl = document.getElementById('calc-brain-age');
    if (bpiEl) bpiEl.textContent = `${this.data.neuroScore} BPI`;
    if (ageEl) ageEl.textContent = `${this.getBrainAge()} Yaş Seviyesi`;

    // Bars
    const dims = ['flex', 'spatial', 'memory', 'speed', 'focus'];
    const keys = ['flexibility', 'spatial', 'memory', 'speed', 'focus'];
    
    keys.forEach((k, idx) => {
      const val = this.data.scores[k] || 75;
      const scoreTxt = document.getElementById(`score-dim-${dims[idx]}`);
      const barFill = document.getElementById(`bar-dim-${dims[idx]}`);
      if (scoreTxt) scoreTxt.textContent = `${val}/100`;
      if (barFill) barFill.style.width = `${val}%`;
    });

    // Quick stats on dashboard
    const sortedDims = Object.entries(this.data.scores).sort((a, b) => b[1] - a[1]);
    const nameMap = {
      flexibility: 'Esneklik & İnhibisyon',
      spatial: 'Uzamsal Muhakeme',
      memory: 'Çalışma Belleği',
      speed: 'İşlem Hızı',
      focus: 'Odak & Kararlılık'
    };

    const strongEl = document.getElementById('quick-strongest');
    const weakEl = document.getElementById('quick-weakest');
    if (strongEl && sortedDims[0]) {
      strongEl.textContent = `${nameMap[sortedDims[0][0]]} (%${sortedDims[0][1]})`;
    }
    if (weakEl && sortedDims[sortedDims.length - 1]) {
      weakEl.textContent = `${nameMap[sortedDims[sortedDims.length - 1][0]]} (%${sortedDims[sortedDims.length - 1][1]})`;
    }

    // Render Badges
    const badgeContainer = document.getElementById('badges-container');
    if (badgeContainer) {
      badgeContainer.innerHTML = this.badges.map(b => `
        <div class="badge-item ${b.unlocked ? 'unlocked' : ''}">
          <span class="b-icon">${b.icon}</span>
          <div class="b-text">
            <span class="b-name">${b.name}</span>
            <span class="b-desc">${b.desc}</span>
          </div>
        </div>
      `).join('');
    }

    // Redraw Radars
    this.drawRadarChart('mini-radar-canvas', 140, 120, 75);
    this.drawRadarChart('large-radar-canvas', 230, 210, 140, true);
  }

  drawRadarChart(canvasId, centerX, centerY, radius, isDetailed = false) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const labels = ['Esneklik', 'Uzamsal', 'Bellek', 'Hız', 'Odak'];
    const keys = ['flexibility', 'spatial', 'memory', 'speed', 'focus'];
    const totalSides = labels.length;
    const angleStep = (Math.PI * 2) / totalSides;

    // Draw background concentric web
    const levels = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;

    for (let l = 1; l <= levels; l++) {
      const r = (radius / levels) * l;
      ctx.beginPath();
      for (let i = 0; i < totalSides; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Draw Spokes
    for (let i = 0; i < totalSides; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Labels
      if (isDetailed) {
        const labelR = radius + 24;
        const lx = centerX + labelR * Math.cos(angle);
        const ly = centerY + labelR * Math.sin(angle);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labels[i], lx, ly);
      }
    }

    // Draw Data Polygon
    ctx.beginPath();
    const points = [];
    for (let i = 0; i < totalSides; i++) {
      const val = (this.data.scores[keys[i]] || 70) / 100;
      const r = radius * Math.max(0.2, Math.min(1, val));
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      points.push({ x, y });
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    // Fill Gradient
    const grad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
    grad.addColorStop(1, 'rgba(176, 38, 255, 0.25)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Stroke Neon
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0; // reset

    // Draw Vertex Nodes
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }

  resetHistory() {
    if (confirm("Tüm bilişsel antrenman geçmişini sıfırlamak istediğinize emin misiniz?")) {
      this.data = this.getDefaultData();
      this.badges.forEach(b => b.unlocked = false);
      this.saveData();
      this.updateUI();
    }
  }
}

window.analytics = new CognitiveAnalytics();
