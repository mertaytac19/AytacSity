class ChaosTheoryGame extends BaseGame {
  constructor(engine) {
    super(engine);
    this.scenarios = [
      { change: 'Kelebek kanat çırptı', outcomes: ['Fırtına', 'Güneşli', 'Kar', 'Yağmur'], correct: 0 },
      { change: 'Domino düştü', outcomes: ['Zincir reaksiyon', 'Durdu', 'Geri döndü', 'Yok'], correct: 0 },
      { change: 'Toprak kaydı', outcomes: ['Sel', 'Deprem', 'Volkan', 'Rüzgar'], correct: 0 }
    ];
  }

  onStart() {
    this.mount.innerHTML = `<div class="chaos-stage" style="text-align:center; padding:20px;">
      <h3 id="chaos-change" style="margin:20px 0;"></h3>
      <div id="chaos-outcomes" style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"></div>
    </div>`;
    this.nextRound();
  }

  nextRound() {
    this.roundStartTime = performance.now();
    const s = this.scenarios[Math.floor(Math.random() * this.scenarios.length)];
    document.getElementById('chaos-change').innerHTML = `<p>${s.change}</p><h3>Sonuç ne olur?</h3>`;
    
    const container = document.getElementById('chaos-outcomes');
    container.innerHTML = s.outcomes.map((out, idx) => `<button class="btn-secondary chaos-btn">${out}</button>`).join('');

    container.querySelectorAll('.chaos-btn').forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        const time = Math.round(performance.now() - this.roundStartTime);
        if (idx === s.correct) {
          this.reportSuccess(140, time);
          this.gameTimeout(() => this.nextRound(), 500);
        } else {
          this.reportError("Yanlış tahmin!");
        }
      });
    });
    this.setRule("Kelebek etkisini tahmin et");
  }
  onDestroy() {}
}
window.ChaosTheoryGame = ChaosTheoryGame;