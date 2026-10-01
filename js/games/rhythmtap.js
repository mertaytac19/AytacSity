class RhythmTapGame {
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
        this.container.innerHTML = `
            <div style="text-align:center; padding:20px; color:#fff;">
                <h3>Ritim & Zamanlama Hızı</h3>
                <p style="margin-bottom:15px;">Küre tam çizgiye çakıştığında BAST!</p>
                <div id="rt-area" style="position:relative; width:250px; height:200px; border:2px solid #334155; margin:20px auto; border-radius:12px; background:#0f172a; overflow:hidden;">
                    <div style="position:absolute; bottom:30px; left:0; width:100%; height:4px; background:#f59e0b;"></div>
                    <div id="rt-ball" style="position:absolute; top:0; left:105px; width:40px; height:40px; background:#38bdf8; border-radius:50%;"></div>
                </div>
                <button id="rt-tap" style="padding:15px 40px; font-size:18px; font-weight:bold; background:#22c55e; border:none; border-radius:10px; color:#fff; cursor:pointer;">BAST! 🎯</button>
            </div>
        `;

        const ball = document.getElementById('rt-ball');
        let topPos = 0;
        const timer = setInterval(() => {
            topPos += 5;
            if (ball) ball.style.top = topPos + 'px';
            if (topPos > 180) {
                clearInterval(timer);
                this.playSound('wrong');
                this.round++; this.nextRound();
            }
        }, 30);

        document.getElementById('rt-tap').onclick = () => {
            clearInterval(timer);
            if (topPos >= 130 && topPos <= 165) {
                this.score += 250; this.playSound('correct'); this.onScore(this.score);
            } else {
                this.playSound('wrong');
            }
            this.round++; this.nextRound();
        };
    }
}
window.RhythmTapGame = RhythmTapGame;