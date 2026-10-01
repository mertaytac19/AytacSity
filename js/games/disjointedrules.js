class DisjointedRulesGame {
    constructor(container, callbacks = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.onGameOver = callbacks.onGameOver || function () { };
        this.onScore = callbacks.onScore || function () { };
        this.playSound = callbacks.playSound || function () { };
        this.score = 0; this.round = 1; this.maxRounds = 6;
    }
    start() { this.score = 0; this.round = 1; this.nextRound(); }
    nextRound() {
        if (this.round > this.maxRounds) return this.onGameOver(this.score);
        const isBlue = Math.random() > 0.5;
        const shape = Math.random() > 0.5 ? 'KARE' : 'DAİRE';
        const num = Math.floor(Math.random() * 9) + 1;

        this.container.innerHTML = `
            <div style="text-align:center; padding:20px; color:#fff;">
                <h3 style="color:${isBlue ? '#3b82f6' : '#ef4444'};">
                    ${isBlue ? 'MAVİ ise: Şekil KARE mi?' : 'KIRMIZI ise: Sayı TEK mi?'}
                </h3>
                <div style="padding:20px; background:#1e293b; border:3px solid ${isBlue ? '#3b82f6' : '#ef4444'}; border-radius:12px; margin:20px auto; max-width:200px;">
                    <div style="font-size:24px; font-weight:bold;">${shape}</div>
                    <div style="font-size:32px; font-weight:bold; color:#f59e0b;">${num}</div>
                </div>
                <div>
                    <button id="dr-yes" style="padding:12px 28px; margin:8px; font-weight:bold; background:#22c55e; border:none; border-radius:8px; color:#fff; cursor:pointer;">EVET</button>
                    <button id="dr-no" style="padding:12px 28px; margin:8px; font-weight:bold; background:#ef4444; border:none; border-radius:8px; color:#fff; cursor:pointer;">HAYIR</button>
                </div>
            </div>
        `;

        const correct = isBlue ? (shape === 'KARE') : (num % 2 !== 0);
        const handleAns = (ans) => {
            if (ans === correct) { this.score += 150; this.playSound('correct'); this.onScore(this.score); }
            else { this.playSound('wrong'); }
            this.round++; this.nextRound();
        };

        document.getElementById('dr-yes').onclick = () => handleAns(true);
        document.getElementById('dr-no').onclick = () => handleAns(false);
    }
}
window.DisjointedRulesGame = DisjointedRulesGame;