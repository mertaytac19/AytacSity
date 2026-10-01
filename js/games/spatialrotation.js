class SpatialRotationGame {
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
        const targetRot = Math.floor(Math.random() * 3 + 1) * 90;

        this.container.innerHTML = `
            <div style="text-align:center; padding:20px; color:#fff;">
                <h3>Zihinsel 3D Döndürme</h3>
                <p style="margin-bottom:15px;">Soldaki şekli Saat Yönünde ${targetRot}° Döndürünce Hangisi Olur?</p>
                <div style="font-size:60px; margin:20px;">🧩</div>
                <div style="display:flex; justify-content:center; gap:20px;">
                    <button class="sr-opt" data-rot="90" style="font-size:40px; padding:10px; background:#1e293b; border:2px solid #3b82f6; border-radius:8px; cursor:pointer; transform:rotate(90deg);">🧩</button>
                    <button class="sr-opt" data-rot="180" style="font-size:40px; padding:10px; background:#1e293b; border:2px solid #3b82f6; border-radius:8px; cursor:pointer; transform:rotate(180deg);">🧩</button>
                    <button class="sr-opt" data-rot="270" style="font-size:40px; padding:10px; background:#1e293b; border:2px solid #3b82f6; border-radius:8px; cursor:pointer; transform:rotate(270deg);">🧩</button>
                </div>
            </div>
        `;

        this.container.querySelectorAll('.sr-opt').forEach(btn => {
            btn.onclick = (e) => {
                const rot = parseInt(e.target.getAttribute('data-rot'));
                if (rot === targetRot) {
                    this.score += 200; this.playSound('correct'); this.onScore(this.score);
                } else {
                    this.playSound('wrong');
                }
                this.round++; this.nextRound();
            };
        });
    }
}
window.SpatialRotationGame = SpatialRotationGame;