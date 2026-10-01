class FlashReflexGame {
    constructor(container, callbacks = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.onGameOver = callbacks.onGameOver || function () { };
        this.onScore = callbacks.onScore || function () { };
        this.playSound = callbacks.playSound || function () { };

        this.score = 0;
        this.round = 1;
        this.maxRounds = 5;
        this.state = 'idle';
        this.startTime = 0;
        this.timer = null;
        this.times = [];
    }

    start() {
        this.score = 0;
        this.round = 1;
        this.times = [];
        this.nextRound();
    }

    nextRound() {
        if (this.round > this.maxRounds) {
            const avgTime = Math.round(this.times.reduce((a, b) => a + b, 0) / this.times.length) || 0;
            this.score = Math.max(0, 2000 - avgTime * 3);
            this.onScore(this.score);
            this.onGameOver(this.score);
            return;
        }

        this.state = 'waiting';
        this.renderWaiting();

        const delay = 1500 + Math.random() * 3000;
        this.timer = setTimeout(() => {
            this.state = 'ready';
            this.startTime = performance.now();
            this.renderReady();
        }, delay);
    }

    renderWaiting() {
        this.container.innerHTML = `
            <div id="fr-box" style="height:300px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#dc2626; border-radius:16px; cursor:pointer; color:#fff; user-select:none;">
                <h2 style="font-size:32px; margin-bottom:10px;">HAZIRLAN...</h2>
                <p>Ekran yeşil olduğunda hemen tıkla!</p>
                <p style="margin-top:15px; opacity:0.8;">Tur ${this.round}/${this.maxRounds}</p>
            </div>
        `;

        document.getElementById('fr-box').onclick = () => this.handleClick();
    }

    renderReady() {
        this.container.innerHTML = `
            <div id="fr-box" style="height:300px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#16a34a; border-radius:16px; cursor:pointer; color:#fff; user-select:none;">
                <h1 style="font-size:48px; font-weight:bold;">ŞİMDİ BAST!</h1>
            </div>
        `;

        document.getElementById('fr-box').onclick = () => this.handleClick();
    }

    handleClick() {
        if (this.state === 'waiting') {
            clearTimeout(this.timer);
            this.playSound('wrong');
            this.container.innerHTML = `
                <div style="height:300px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#334155; border-radius:16px; color:#fff;">
                    <h2>ERKEN BASTIN!</h2>
                    <p style="margin-top:10px; color:#f87171;">Yeşil ekranı beklemen gerekiyordu.</p>
                    <button id="fr-retry" style="margin-top:20px; padding:10px 20px; border:none; border-radius:8px; background:#3b82f6; color:#fff; cursor:pointer; font-weight:bold;">Tekrar Dene</button>
                </div>
            `;
            document.getElementById('fr-retry').onclick = () => this.nextRound();
        } else if (this.state === 'ready') {
            const elapsed = Math.round(performance.now() - this.startTime);
            this.times.push(elapsed);
            this.playSound('correct');

            this.container.innerHTML = `
                <div style="height:300px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#1e293b; border-radius:16px; color:#fff;">
                    <h2 style="color:#4ade80; font-size:36px;">${elapsed} ms</h2>
                    <p style="margin-top:10px;">Harika Tepki!</p>
                    <button id="fr-next" style="margin-top:20px; padding:10px 20px; border:none; border-radius:8px; background:#3b82f6; color:#fff; cursor:pointer; font-weight:bold;">Sonraki Tur</button>
                </div>
            `;

            this.round++;
            document.getElementById('fr-next').onclick = () => this.nextRound();
        }
    }
}
window.FlashReflexGame = FlashReflexGame;