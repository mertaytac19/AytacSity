class MoralCompassGame extends BaseGame {
  constructor(engine) {
    super(engine);
    this.dilemmas = [
      { q: 'Yalan söyleyip birini korumak mı, doğruyu söyleyip incitmek mi?', a: ['Yalan', 'Doğru'], c: 1 },
      { q: 'Birey için mi, toplum için mi karar ver?', a: ['Birey', 'Toplum'], c: 1 },
      { q: 'Kısa vadeli kazanç mı, uzun vadeli kazanç mı?', a: ['Kısa', 'Uzun'], c: 1 }
    ];
  }

  onStart() {
    this.mount.innerHTML = `<div class="moral-stage" style="text-align:center; padding:20px;">
      <h3 id="moral-situation" style="margin:30px 0;"></h3>
      <div id="moral-options" style="display:grid; grid-template-columns:1fr 1fr; gap:15px;"></div>
    </div>`;
    this.nextRound();
  }

  nextRound() {
    this.roundStartTime = performance.now();
    const d = this.dilemmas[Math.floor(Math.random() * this.dilemmas.length)];
    document.getElementById('moral-situation').textContent = d.q;
    
    const container = document.getElementById('moral-options');
    container.innerHTML = d.a.map((opt, idx) => `<button class="btn-primary moral-btn" style="padding:20px;">${opt}</button>`).join('');

    container.querySelectorAll('.moral-btn').forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        const time = Math.round(performance.now() - this.roundStartTime);
        if (idx === d.c) {
          this.reportSuccess(140, time);
          this.gameTimeout(() => this.nextRound(), 500);
        } else {
          this.reportError("Ahlaki pusula sapdı!");
        }
      });
    });
    this.setRule("Ahlaki ikileme tutarlı karar ver");
  }
  onDestroy() {}
}
window.MoralCompassGame = MoralCompassGame;