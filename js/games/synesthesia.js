class SynesthesiaGame extends BaseGame {
  constructor(engine) {
    super(engine);
    this.sounds = [
      { name: '🎵', color: '#ff0055', label: 'Keskin' },
      { name: '🎶', color: '#00f0ff', label: 'Yumuşak' },
      { name: '🎼', color: '#ffb703', label: 'Sıcak' },
      { name: '🎹', color: '#b026ff', label: 'Derin' }
    ];
  }

  onStart() {
    this.mount.innerHTML = `<div class="synesthesia-stage" style="text-align:center; padding:20px;">
      <div id="syn-display" style="font-size:5rem; margin:20px;"></div>
      <p style="margin-bottom:20px;">Bu sesin rengi ne?</p>
      <div id="syn-colors" style="display:grid; grid-template-columns:1fr 1fr; gap:15px;"></div>
    </div>`;
    this.nextRound();
  }

  nextRound() {
    this.roundStartTime = performance.now();
    const current = this.sounds[Math.floor(Math.random() * this.sounds.length)];
    document.getElementById('syn-display').innerHTML = current.name;

    const options = [current];
    while (options.length < 4) {
      const rnd = this.sounds[Math.floor(Math.random() * this.sounds.length)];
      if (!options.find(o => o.label === rnd.label)) options.push(rnd);
    }
    options.sort(() => Math.random() - 0.5);

    const container = document.getElementById('syn-colors');
    container.innerHTML = options.map(opt => `
      <button class="syn-color-btn" style="background:${opt.color}; color:#fff; padding:15px; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">${opt.label}</button>
    `).join('');

    container.querySelectorAll('.syn-color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const time = Math.round(performance.now() - this.roundStartTime);
        if (btn.textContent === current.label) {
          this.reportSuccess(130, time);
          this.gameTimeout(() => this.nextRound(), 500);
        } else {
          this.reportError("Yanlış eşleşme!");
        }
      });
    });
    this.setRule("Sesin hissettirdiği rengi seç");
  }
  onDestroy() {}
}
window.SynesthesiaGame = SynesthesiaGame;