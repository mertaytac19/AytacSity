class ColorMatchGame extends BaseGame {
  constructor(engine) {
    super(engine);
    this.colors = [
      { name: 'Kırmızı', hex: '#ff0055', word: 'KIRMIZI' },
      { name: 'Mavi', hex: '#00f0ff', word: 'MAVİ' },
      { name: 'Yeşil', hex: '#00ff9d', word: 'YEŞİL' },
      { name: 'Sarı', hex: '#ffb703', word: 'SARI' }
    ];
    this.currentRound = null;
  }

  onStart() {
    this.renderStage();
    this.nextRound();
  }

  renderStage() {
    this.mount.innerHTML = `
      <div class="colormatch-stage" style="text-align:center; padding:20px;">
        <h3>Renk & Anlam</h3>
        <p>Yazının RENGİNİ seç (kelimeyi değil!)</p>
        <div id="color-word-display" style="font-size:4rem; font-weight:bold; margin:30px 0; height:80px;"></div>
        <div id="color-options" style="display:grid; grid-template-columns:1fr 1fr; gap:15px;"></div>
      </div>
    `;
  }

  nextRound() {
    this.roundStartTime = performance.now();
    
    // Rastgele kelime ve renk seç (farklı olabilirler - Stroop etkisi)
    const wordObj = this.colors[Math.floor(Math.random() * this.colors.length)];
    const colorObj = this.colors[Math.floor(Math.random() * this.colors.length)];
    
    this.currentRound = {
      word: wordObj.word,
      color: colorObj.name,
      correctIndex: this.colors.findIndex(c => c.name === colorObj.name)
    };
    
    const display = document.getElementById('color-word-display');
    display.textContent = this.currentRound.word;
    display.style.color = this.colors.find(c => c.name === this.currentRound.color).hex;
    
    const container = document.getElementById('color-options');
    container.innerHTML = this.colors.map((c, idx) => `
      <button class="color-option-btn" data-idx="${idx}" style="
        background:${c.hex};
        color:#fff;
        padding:15px;
        border:none;
        border-radius:8px;
        font-weight:bold;
        cursor:pointer;
        font-size:1.1rem;
      ">${c.name}</button>
    `).join('');
    
    container.querySelectorAll('.color-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'));
        const time = Math.round(performance.now() - this.roundStartTime);
        
        if (idx === this.currentRound.correctIndex) {
          this.reportSuccess(120, time);
          this.gameTimeout(() => this.nextRound(), 500);
        } else {
          this.reportError("Yanlış renk!");
        }
      });
    });
    
    this.setRule(`Kelimenin RENGİNİ seç (kelimeyi değil)`);
  }

  onDestroy() {
    this.currentRound = null;
  }
}

window.ColorMatchGame = ColorMatchGame;