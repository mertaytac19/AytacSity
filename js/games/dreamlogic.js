class DreamLogicGame extends BaseGame {
  constructor(engine) {
    super(engine);
    this.scenarios = [
      { q: 'Uçan bir balık gördün. Ne yaparsın?', a: ['Şaşır', 'Uçur', 'Yüz', 'Pişir'], c: 1 },
      { q: 'Zaman geriye akıyor. Saat kaç?', a: ['12:00', 'Dün', 'Yarın', 'Şimdi'], c: 2 },
      { q: 'Renklerin sesi var. Mavi ne çalar?', a: ['Davul', 'Keman', 'Flüt', 'Piyano'], c: 2 }
    ];
  }

  onStart() {
    this.mount.innerHTML = `<div class="dream-stage" style="text-align:center; padding:20px;">
      <h3 id="dream-question" style="margin:30px 0;"></h3>
      <div id="dream-answers" style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"></div>
    </div>`;
    this.nextRound();
  }

  nextRound() {
    this.roundStartTime = performance.now();
    const s = this.scenarios[Math.floor(Math.random() * this.scenarios.length)];
    document.getElementById('dream-question').textContent = s.q;
    
    const container = document.getElementById('dream-answers');
    container.innerHTML = s.a.map((ans, idx) => `<button class="btn-secondary dream-btn">${ans}</button>`).join('');

    container.querySelectorAll('.dream-btn').forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        const time = Math.round(performance.now() - this.roundStartTime);
        if (idx === s.c) {
          this.reportSuccess(150, time);
          this.gameTimeout(() => this.nextRound(), 500);
        } else {
          this.reportError("Rüya mantığı değil!");
        }
      });
    });
    this.setRule("Rüya mantığıyla düşün");
  }
  onDestroy() {}
}
window.DreamLogicGame = DreamLogicGame;