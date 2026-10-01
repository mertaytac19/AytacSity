class NumberCascadeGame {
    constructor(container, callbacks = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.onGameOver = callbacks.onGameOver || function () { };
        this.onScore = callbacks.onScore || function () { };
        this.playSound = callbacks.playSound || function () { };
        this.score = 0;
        this.round = 1;
        this.maxRounds = 5;
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
        const target = 15;
        const num1 = Math.floor(Math.random() * 9) + 1;
        const num2 = target - num1;
        let numbers = [num1, num2, 2, 4, 8, 9].sort(() => 0.5 - Math.random());

        let btnsHtml = numbers.map((n, idx) => `
            <button class="nc-btn" data-idx="${idx}" data-val="${n}" style="width:60px; height:60px; font-size:22px; font-weight:bold; background:#1e293b; border:2px solid #22c55e; color:#fff; border-radius:12px; cursor:pointer;">${n}</button>
        `).join('');

        this.container.innerHTML = `
            <div style="text-align:center; padding:20px; color:#fff;">
                <h3>Hedef Toplam: <span style="color:#22c55e; font-size:32px;">${target}</span></h3>
                <p style="margin-bottom:20px;">Toplamı ${target} yapan 2 sayıyı seç!</p>
                <div style="display:grid; grid-template-columns:repeat(3, 60px); gap:12px; justify-content:center; margin:0 auto;">${btnsHtml}</div>
            </div>
        `;

        this.container.querySelectorAll('.nc-btn').forEach(btn => {
            btn.onclick = (e) => {
                const el = e.target;
                const val = parseInt(el.getAttribute('data-val'));
                const idx = el.getAttribute('data-idx');

                if (this.selected.some(s => s.idx === idx)) return;

                el.style.borderColor = '#f59e0b';
                this.selected.push({ idx, val, el });

                if (this.selected.length === 2) {
                    if (this.selected[0].val + this.selected[1].val === target) {
                        this.score += 200;
                        this.playSound('correct');
                        this.onScore(this.score);
                        this.round++;
                        setTimeout(() => this.nextRound(), 500);
                    } else {
                        this.playSound('wrong');
                        setTimeout(() => {
                            this.selected.forEach(s => s.el.style.borderColor = '#22c55e');
                            this.selected = [];
                        }, 400);
                    }
                }
            };
        });
    }
}
window.NumberCascadeGame = NumberCascadeGame;