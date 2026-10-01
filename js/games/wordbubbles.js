class WordBubblesGame {
    constructor(container, callbacks = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.onGameOver = callbacks.onGameOver || function () { };
        this.onScore = callbacks.onScore || function () { };
        this.playSound = callbacks.playSound || function () { };
        this.score = 0;
        this.round = 1;
        this.maxRounds = 5;
        this.data = [
            { root: 'KİTAP', valid: 'KİTAPLIK', invalid: ['KİTAPÇI', 'KÂTİP', 'KİTLE'] },
            { root: 'YAZI', valid: 'YAZAR', invalid: ['YAZLIK', 'YAZIN', 'YÜZÜK'] },
            { root: 'GÖZ', valid: 'GÖZLÜK', invalid: ['GÖZE', 'GÖLGE', 'GÖZLE'] }
        ];
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
        const item = this.data[(this.round - 1) % this.data.length];
        let options = [item.valid, ...item.invalid].sort(() => 0.5 - Math.random());

        let optsHtml = options.map(opt => `
            <button class="wb-opt" data-word="${opt}" style="padding:15px; font-size:16px; font-weight:bold; background:#1e293b; border:2px solid #a855f7; color:#fff; border-radius:50px; cursor:pointer; margin:8px;">${opt}</button>
        `).join('');

        this.container.innerHTML = `
            <div style="text-align:center; padding:20px; color:#fff;">
                <h3>Kök: <span style="color:#a855f7; font-size:28px;">"${item.root}"</span></h3>
                <p style="margin-bottom:20px;">Bu kökten türetilen kelimeyi seç!</p>
                <div style="display:flex; justify-content:center; flex-wrap:wrap; max-width:350px; margin:0 auto;">${optsHtml}</div>
            </div>
        `;

        this.container.querySelectorAll('.wb-opt').forEach(btn => {
            btn.onclick = (e) => {
                const w = e.target.getAttribute('data-word');
                if (w === item.valid) {
                    this.score += 200;
                    this.playSound('correct');
                    this.onScore(this.score);
                } else {
                    this.playSound('wrong');
                }
                this.round++;
                this.nextRound();
            };
        });
    }
}
window.WordBubblesGame = WordBubblesGame;