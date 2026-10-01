class PatternBurstGame {
    constructor(container, callbacks = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.onGameOver = callbacks.onGameOver || function () { };
        this.onScore = callbacks.onScore || function () { };
        this.playSound = callbacks.playSound || function () { };
        this.score = 0;
        this.round = 1;
        this.maxRounds = 5;
        this.symbols = ['▲', '■', '●', '★', '◆', '✦', '♠', '♣'];
        this.selected = [];
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
        this.selected = [];
        const duplicate = this.symbols[Math.floor(Math.random() * this.symbols.length)];
        let items = [duplicate, duplicate];
        let available = this.symbols.filter(s => s !== duplicate);
        while (items.length < 8) {
            items.push(available.pop());
        }
        items.sort(() => 0.5 - Math.random());

        let html = items.map((sym, idx) => `
            <button class="pb-btn" data-idx="${idx}" data-sym="${sym}" style="font-size:36px; height:70px; background:#1e293b; border:2px solid #3b82f6; border-radius:12px; color:#fff; cursor:pointer;">${sym}</button>
        `).join('');

        this.container.innerHTML = `
            <div style="text-align:center; padding:20px; color:#fff;">
                <h3>Hızlı İkiz Bulma</h3>
                <p style="margin-bottom:15px;">Aynı olan İKİ sembolü seç! (Tur ${this.round}/${this.maxRounds})</p>
                <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; max-width:320px; margin:0 auto;">${html}</div>
            </div>
        `;

        this.container.querySelectorAll('.pb-btn').forEach(btn => {
            btn.onclick = (e) => {
                const el = e.target;
                const sym = el.getAttribute('data-sym');
                const idx = el.getAttribute('data-idx');

                if (this.selected.some(s => s.idx === idx)) return;

                el.style.borderColor = '#f59e0b';
                this.selected.push({ idx, sym, el });

                if (this.selected.length === 2) {
                    if (this.selected[0].sym === this.selected[1].sym) {
                        this.score += 200;
                        this.playSound('correct');
                        this.onScore(this.score);
                        this.round++;
                        setTimeout(() => this.nextRound(), 500);
                    } else {
                        this.playSound('wrong');
                        setTimeout(() => {
                            this.selected.forEach(s => s.el.style.borderColor = '#3b82f6');
                            this.selected = [];
                        }, 400);
                    }
                }
            };
        });
    }
}
window.PatternBurstGame = PatternBurstGame;