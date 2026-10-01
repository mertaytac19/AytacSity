class ChalkboardGame {
    constructor(container, callbacks = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.onGameOver = callbacks.onGameOver || function () { };
        this.onScore = callbacks.onScore || function () { };
        this.playSound = callbacks.playSound || function () { };
        this.score = 0;
        this.round = 1;
        this.maxRounds = 6;
    }
    start() {
        this.score = 0;
        this.round = 1;
        this.nextRound();
    }
    nextRound() {
        if (this.round > this.maxRounds) {
            this.onGameOver(this.score);
            return;
        }
        const a = Math.floor(Math.random() * 10) + 2;
        const b = Math.floor(Math.random() * 10) + 2;
        const c = Math.floor(Math.random() * 10) + 2;
        const d = Math.floor(Math.random() * 10) + 2;

        const val1 = a + b;
        const val2 = c + d;

        this.container.innerHTML = `
            <div style="text-align:center; padding:20px; color:#fff;">
                <h3>Hızlı İşlem Karşılaştırma</h3>
                <div style="display:flex; justify-content:center; align-items:center; gap:20px; margin:30px 0; font-size:28px; font-weight:bold;">
                    <div style="background:#0f172a; border:2px solid #38bdf8; padding:15px 20px; border-radius:12px;">${a} + ${b}</div>
                    <div>VS</div>
                    <div style="background:#0f172a; border:2px solid #38bdf8; padding:15px 20px; border-radius:12px;">${c} + ${d}</div>
                </div>
                <div>
                    <button id="cb-left" style="padding:12px 20px; margin:4px; font-weight:bold; background:#3b82f6; border:none; border-radius:8px; color:#fff; cursor:pointer;">SOL BÜYÜK</button>
                    <button id="cb-eq" style="padding:12px 20px; margin:4px; font-weight:bold; background:#f59e0b; border:none; border-radius:8px; color:#fff; cursor:pointer;">EŞİT</button>
                    <button id="cb-right" style="padding:12px 20px; margin:4px; font-weight:bold; background:#3b82f6; border:none; border-radius:8px; color:#fff; cursor:pointer;">SAĞ BÜYÜK</button>
                </div>
            </div>
        `;

        let correct = 'eq';
        if (val1 > val2) correct = 'left';
        if (val2 > val1) correct = 'right';

        const handleAns = (ans) => {
            if (ans === correct) {
                this.score += 150;
                this.playSound('correct');
                this.onScore(this.score);
            } else {
                this.playSound('wrong');
            }
            this.round++;
            this.nextRound();
        };

        document.getElementById('cb-left').onclick = () => handleAns('left');
        document.getElementById('cb-eq').onclick = () => handleAns('eq');
        document.getElementById('cb-right').onclick = () => handleAns('right');
    }
}
window.ChalkboardGame = ChalkboardGame;