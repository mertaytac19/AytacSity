class EmotionDecoderGame extends BaseGame {
  constructor(engine) {
    super(engine);
    this.mixedEmotions = [
      { emojis: ['😊', '😲'], label: 'Mutlu Şaşkın' },
      { emojis: ['😢', '😠'], label: 'Üzgün Kızgın' },
      { emojis: ['😨', '😲'], label: 'Korkmuş Şaşkın' },
      { emojis: ['😌', '😊'], label: 'Rahat Mutlu' }
    ];
  }

  onStart() {
    this.mount.innerHTML = `<div class="emotion-stage" style="text-align:center; padding:20px;">
      <div id="emotion-display" style="font-size:4rem; margin:20px;"></div>
      <div id="emotion-options" style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"></div>
    </div>`;
    this.nextRound();
  }

  nextRound() {
    this.roundStartTime = performance.now();
    this.current = this.mixedEmotions[Math.floor(Math.random() * this.mixedEmotions.length)];
    
    document.getElementById('emotion-display').innerHTML = this.current.emojis.map(e => `<span>${e}</span>`).join('');
    
    const options = [this.current];
    while (options.length < 4) {
      const rnd = this.mixedEmotions[Math.floor(Math.random() * this.mixedEmotions.length)];
      if (!options.find(o => o.label === rnd.label)) options.push(rnd);
    }
    options.sort(() => Math.random() - 0.5);

    const container = document.getElementById('emotion-options');
    container.innerHTML = options.map(opt => `<button class="btn-secondary emotion-btn">${opt.label}</button>`).join('');

    container.querySelectorAll('.emotion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const time = Math.round(performance.now() - this.roundStartTime);
        if (btn.textContent === this.current.label) {
          this.reportSuccess(120, time);
          this.gameTimeout(() => this.nextRound(), 500);
        } else {
          this.reportError("Yanlış duygu!");
        }
      });
    });
    this.setRule("Karmaşık duygu kombinasyonunu seç");
  }
  onDestroy() {}
}
window.EmotionDecoderGame = EmotionDecoderGame;