class QuantumEntanglementGame extends BaseGame {
  constructor(engine) {
    super(engine);
    this.particles = [];
  }

  onStart() {
    this.mount.innerHTML = `<div class="quantum-stage" style="text-align:center; padding:20px;">
      <h3>Kuantum Dolanıklık</h3>
      <p>Dolanık çiftleri bul (Aynı yöne dönenler)</p>
      <div id="quantum-particles" style="display:flex; flex-wrap:wrap; justify-content:center; gap:20px; margin:30px 0;"></div>
    </div>`;
    this.nextRound();
  }

  nextRound() {
    this.roundStartTime = performance.now();
    this.particles = [];
    for (let i = 0; i < 6; i += 2) {
      const state = Math.random() > 0.5 ? 'up' : 'down';
      this.particles.push({ id: i, state: state, pair: i + 1 });
      this.particles.push({ id: i + 1, state: state, pair: i });
    }
    this.particles.sort(() => Math.random() - 0.5);
    this.renderParticles();
    this.setRule("Dolanık (eşleşen) çiftlere tıkla");
  }

  renderParticles() {
    const container = document.getElementById('quantum-particles');
    container.innerHTML = this.particles.map(p => `
      <div class="q-particle" data-id="${p.id}" style="width:60px; height:60px; background:rgba(255,255,255,0.1); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:2rem; cursor:pointer; border:2px solid transparent;">
        ${p.state === 'up' ? '↑' : '↓'}
      </div>
    `).join('');

    let selected = null;
    container.querySelectorAll('.q-particle').forEach(el => {
      el.addEventListener('click', () => {
        const id = parseInt(el.getAttribute('data-id'));
        if (!selected) {
          selected = id;
          el.style.borderColor = '#00f0ff';
        } else {
          const p1 = this.particles.find(p => p.id === selected);
          const p2 = this.particles.find(p => p.id === id);
          const time = Math.round(performance.now() - this.roundStartTime);
          
          if (p1 && p2 && p1.pair === p2.id) {
            this.reportSuccess(160, time);
            this.gameTimeout(() => this.nextRound(), 500);
          } else {
            this.reportError("Dolanık değil!");
          }
          container.querySelectorAll('.q-particle').forEach(x => x.style.borderColor = 'transparent');
          selected = null;
        }
      });
    });
  }
  onDestroy() {}
}
window.QuantumEntanglementGame = QuantumEntanglementGame;