class BalanceScaleGame extends BaseGame {
  constructor(engine) {
    super(engine);
    this.scales = [];
    this.currentProblem = null;
  }

  onStart() {
    this.renderStage();
    this.nextRound();
  }

  renderStage() {
    this.mount.innerHTML = `
      <div class="balance-stage" style="text-align:center; padding:20px;">
        <h3>Terazi Mantığı</h3>
        <p>Hangi taraf daha ağır?</p>
        <div id="balance-display" style="margin:30px 0; display:flex; justify-content:center; align-items:center; gap:20px;"></div>
        <div id="balance-options" style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:15px; max-width:400px; margin:0 auto;"></div>
      </div>
    `;
  }

  nextRound() {
    this.roundStartTime = performance.now();
    
    // Rastgele ağırlıklar oluştur
    const leftWeight = Math.floor(Math.random() * 20) + 1;
    const rightWeight = Math.floor(Math.random() * 20) + 1;
    
    this.currentProblem = {
      left: leftWeight,
      right: rightWeight,
      correct: leftWeight > rightWeight ? 'left' : (leftWeight < rightWeight ? 'right' : 'equal')
    };
    
    const display = document.getElementById('balance-display');
    display.innerHTML = `
      <div style="text-align:center;">
        <div style="font-size:3rem; font-weight:bold; color:#00f0ff;">${leftWeight} kg</div>
        <div style="font-size:2rem;">⚖️</div>
        <div style="margin-top:10px; color:#94a3b8;">SOL</div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:3rem; font-weight:bold; color:#ffb703;">${rightWeight} kg</div>
        <div style="font-size:2rem;">⚖️</div>
        <div style="margin-top:10px; color:#94a3b8;">SAĞ</div>
      </div>
    `;
    
    const container = document.getElementById('balance-options');
    container.innerHTML = `
      <button class="balance-btn" data-answer="left" style="padding:15px; background:rgba(0,240,255,0.2); border:2px solid #00f0ff; color:#fff; border-radius:8px; cursor:pointer; font-weight:bold;">SOL AĞIR</button>
      <button class="balance-btn" data-answer="equal" style="padding:15px; background:rgba(255,255,255,0.1); border:2px solid #fff; color:#fff; border-radius:8px; cursor:pointer; font-weight:bold;">EŞİT</button>
      <button class="balance-btn" data-answer="right" style="padding:15px; background:rgba(255,183,3,0.2); border:2px solid #ffb703; color:#fff; border-radius:8px; cursor:pointer; font-weight:bold;">SAĞ AĞIR</button>
    `;
    
    container.querySelectorAll('.balance-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const answer = btn.getAttribute('data-answer');
        const time = Math.round(performance.now() - this.roundStartTime);
        
        if (answer === this.currentProblem.correct) {
          this.reportSuccess(140, time);
          this.gameTimeout(() => this.nextRound(), 500);
        } else {
          this.reportError("Yanlış terazi!");
        }
      });
    });
    
    this.setRule("Hangi taraf daha ağır?");
  }

  onDestroy() {
    this.currentProblem = null;
  }
}

window.BalanceScaleGame = BalanceScaleGame;