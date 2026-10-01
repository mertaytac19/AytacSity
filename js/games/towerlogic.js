class TowerLogicGame {
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
                <h3>Kule Dizilim Mantığı</h3>
                <p style="margin-bottom:15px;">Blokları Büyükten Küçüğe Doğru Sırala (En Alt Büyük)!</p>
                <div style="display:flex; justify-content:center; gap:15px; margin:20px;">
                    <button class="tl-block" data-size="3" style="padding:15px 30px; background:#38bdf8; border:none; border-radius:8px; color:#fff; font-weight:bold; cursor:pointer;">🟩 BÜYÜK (3)</button>
                    <button class="tl-block" data-size="1" style="padding:15px 30px; background:#38bdf8; border:none; border-radius:8px; color:#fff; font-weight:bold; cursor:pointer;">🟨 KÜÇÜK (1)</button>
                    <button class="tl-block" data-size="2" style="padding:15px 30px; background:#38bdf8; border:none; border-radius:8px; color:#fff; font-weight:bold; cursor:pointer;">🟦 ORTA (2)</button>
                </div>
                <div id="tl-tower" style="min-height:100px; border-bottom:4px solid #fff; max-width:250px; margin:0 auto; display:flex; flex-direction:column-reverse; align-items:center; gap:4px;"></div>
            </div>
        `;

        this.stack = [];
        this.container.querySelectorAll('.tl-block').forEach(btn => {
            btn.onclick = (e) => {
                const size = parseInt(e.target.getAttribute('data-size'));
                this.stack.push(size);
                const div = document.createElement('div');
                div.style.width = (size * 60) + 'px';
                div.style.height = '20px';
                div.style.background = '#f59e0b';
                div.style.borderRadius = '4px';
                document.getElementById('tl-tower').appendChild(div);

                if (this.stack.length === 3) {
                    if (this.stack[0] === 3 && this.stack[1] === 2 && this.stack[2] === 1) {
                        this.score += 200; this.playSound('correct'); this.onScore(this.score);
                    } else {
                        this.playSound('wrong');
                    }
                    this.round++; setTimeout(() => this.nextRound(), 600);
                }
            };
        });
    }
}
window.TowerLogicGame = TowerLogicGame;