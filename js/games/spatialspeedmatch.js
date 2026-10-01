class SpatialSpeedMatchGame {
    constructor(container, callbacks = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.onGameOver = callbacks.onGameOver || function () { };
        this.onScore = callbacks.onScore || function () { };
        this.playSound = callbacks.playSound || function () { };
        this.score = 0; this.round = 1; this.maxRounds = 8;
        this.shapes = ['🟢', '🟦', '🔺', '⭐', '💎'];
        this.prev = null;
    }
    start() { this.score = 0; this.round = 1; this.prev = null; this.nextRound(); }
    nextRound() {
        if (this.round > this.maxRounds) return this.onGameOver(this.score);
        const current = this.shapes[Math.floor(Math.random() * this.shapes.length)];
        const isFirst = (this.round === 1);

        this.container.innerHTML = `
            <div style="text-align:center; padding:20px; color:#fff;">
                <h3>Uzamsal Hız Karşılaştırma</h3>
                <p style="margin-bottom:15px;">${isFirst ? 'İlk Şekli Aklında Tut!' : 'Bir önceki şekil ile AYNI mı?'}</p>
                <div style="font-size:72px; margin:20px 0;">${current}</div>
                ${!isFirst ? `
                    <div>
                        <button id="ssm-yes" style="padding:12px 28px; margin:8px; font-weight:bold; background:#22c55e; border:none; border-radius:8px; color:#fff; cursor:pointer;">AYNI</button>
                        <button id="ssm-no" style="padding:12px 28px; margin:8px; font-weight:bold; background:#ef4444; border:none; border-radius:8px; color:#fff; cursor:pointer;">FARKLI</button>
                    </div>
                ` : `<button id="ssm-start" style="padding:12px 28px; font-weight:bold; background:#3b82f6; border:none; border-radius:8px; color:#fff; cursor:pointer;">DEVAM ET</button>`}
            </div>
        `;

        if (isFirst) {
            document.getElementById('ssm-start').onclick = () => {
                this.prev = current; this.round++; this.nextRound();
            };
        } else {
            const match = (current === this.prev);
            const handleAns = (ans) => {
                if (ans === match) { this.score += 150; this.playSound('correct'); this.onScore(this.score); }
                else { this.playSound('wrong'); }
                this.prev = current; this.round++; this.nextRound();
            };
            document.getElementById('ssm-yes').onclick = () => handleAns(true);
            document.getElementById('ssm-no').onclick = () => handleAns(false);
        }
    }
}
window.SpatialSpeedMatchGame = SpatialSpeedMatchGame;