class QuantumGridGame {
    constructor(container, callbacks = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.onGameOver = callbacks.onGameOver || function () { };
        this.onScore = callbacks.onScore || function () { };
        this.playSound = callbacks.playSound || function () { };
        this.score = 0; this.round = 1; this.maxRounds = 5;
    }
    start() { this.score = 0; this.round = 1; this.nextRound(); }
    nextRound() {
        if (this.round > this.maxRounds) return this.onGameOver(this.score);
        this.energy = 0;
        this.targetEnergy = 10;
        this.render();
    }
    render() {
        this.container.innerHTML = `
            <div style="text-align:center; padding:20px; color:#fff;">
                <h3>⚛️ Kuantum Şebeke Denkleştirme (Özgün Oyun)</h3>
                <p>Enerjiyi Tam <span style="color:#00f0ff; font-weight:bold;">${this.targetEnergy}</span> Seviyesine Ulaştır!</p>
                <div style="font-size:36px; font-weight:bold; color:#f59e0b; margin:20px;">Mevcut Enerji: ${this.energy}</div>
                <div style="display:flex; justify-content:center; gap:15px;">
                    <button class="qg-node" data-val="3" style="padding:15px 20px; font-size:18px; font-weight:bold; background:#00f0ff; border:none; border-radius:8px; color:#000; cursor:pointer;">+3 Foton</button>
                    <button class="qg-node" data-val="4" style="padding:15px 20px; font-size:18px; font-weight:bold; background:#b026ff; border:none; border-radius:8px; color:#fff; cursor:pointer;">+4 Foton</button>
                    <button class="qg-node" data-val="-2" style="padding:15px 20px; font-size:18px; font-weight:bold; background:#ef4444; border:none; border-radius:8px; color:#fff; cursor:pointer;">-2 Denge</button>
                </div>
            </div>
        `;

        this.container.querySelectorAll('.qg-node').forEach(btn => {
            btn.onclick = (e) => {
                const val = parseInt(e.target.getAttribute('data-val'));
                this.energy += val;
                if (this.energy === this.targetEnergy) {
                    this.score += 300; this.playSound('correct'); this.onScore(this.score);
                    this.round++; setTimeout(() => this.nextRound(), 500);
                } else if (this.energy > this.targetEnergy + 5) {
                    this.playSound('wrong');
                    this.round++; setTimeout(() => this.nextRound(), 500);
                } else {
                    this.render();
                }
            };
        });
    }
}
window.QuantumGridGame = QuantumGridGame;