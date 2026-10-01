class PathfinderGame {
    constructor(container, callbacks = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.onGameOver = callbacks.onGameOver || function () { };
        this.onScore = callbacks.onScore || function () { };
        this.playSound = callbacks.playSound || function () { };
        this.score = 0;
        this.round = 1;
        this.maxRounds = 5;
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
        this.pos = { r: 0, c: 0 };
        this.target = { r: 3, c: 3 };
        this.obstacles = [{ r: 1, c: 1 }, { r: 2, c: 2 }, { r: 0, c: 2 }];
        this.renderGrid();
    }
    renderGrid() {
        let cellsHtml = '';
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                let bg = '#1e293b';
                let content = '';
                if (r === this.pos.r && c === this.pos.c) { bg = '#3b82f6'; content = '🤖'; }
                else if (r === this.target.r && c === this.target.c) { bg = '#22c55e'; content = '🎯'; }
                else if (this.obstacles.some(o => o.r === r && o.c === c)) { bg = '#ef4444'; content = '🚧'; }

                cellsHtml += `<div style="width:60px; height:60px; background:${bg}; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:24px;">${content}</div>`;
            }
        }

        this.container.innerHTML = `
            <div style="text-align:center; padding:20px; color:#fff;">
                <h3>Engellere Çarpmadan Hedefe Ulaş!</h3>
                <div style="display:grid; grid-template-columns:repeat(4, 60px); gap:8px; justify-content:center; margin:20px auto;">${cellsHtml}</div>
                <div>
                    <button class="pf-move" data-dir="up" style="padding:10px 20px; margin:4px; font-weight:bold; background:#38bdf8; border:none; border-radius:6px; cursor:pointer;">⬆️ YUKARI</button><br>
                    <button class="pf-move" data-dir="left" style="padding:10px 20px; margin:4px; font-weight:bold; background:#38bdf8; border:none; border-radius:6px; cursor:pointer;">⬅️ SOL</button>
                    <button class="pf-move" data-dir="down" style="padding:10px 20px; margin:4px; font-weight:bold; background:#38bdf8; border:none; border-radius:6px; cursor:pointer;">⬇️ AŞAĞI</button>
                    <button class="pf-move" data-dir="right" style="padding:10px 20px; margin:4px; font-weight:bold; background:#38bdf8; border:none; border-radius:6px; cursor:pointer;">➡️ SAĞ</button>
                </div>
            </div>
        `;

        this.container.querySelectorAll('.pf-move').forEach(btn => {
            btn.onclick = (e) => {
                const dir = e.target.getAttribute('data-dir');
                let nr = this.pos.r, nc = this.pos.c;
                if (dir === 'up') nr--;
                if (dir === 'down') nr++;
                if (dir === 'left') nc--;
                if (dir === 'right') nc++;

                if (nr < 0 || nr > 3 || nc < 0 || nc > 3 || this.obstacles.some(o => o.r === nr && o.c === nc)) {
                    this.playSound('wrong');
                    return;
                }

                this.pos = { r: nr, c: nc };
                if (this.pos.r === this.target.r && this.pos.c === this.target.c) {
                    this.score += 200;
                    this.playSound('correct');
                    this.onScore(this.score);
                    this.round++;
                    this.nextRound();
                } else {
                    this.renderGrid();
                }
            };
        });
    }
}
window.PathfinderGame = PathfinderGame;