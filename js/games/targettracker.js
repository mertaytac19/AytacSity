class TargetTrackerGame {
    constructor(container, callbacks = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.onGameOver = callbacks.onGameOver || function () { };
        this.onScore = callbacks.onScore || function () { };
        this.playSound = callbacks.playSound || function () { };

        this.score = 0;
        this.round = 1;
        this.maxRounds = 5;
        this.balls = [];
        this.targets = [];
        this.selected = [];
        this.state = 'idle';
        this.animId = null;
    }

    start() {
        this.score = 0;
        this.round = 1;
        this.setupCanvas();
        this.nextRound();
    }

    setupCanvas() {
        this.container.innerHTML = `
            <div style="text-align:center; color:#fff;">
                <div id="tt-status" style="margin-bottom:10px; font-weight:bold; font-size:18px;"></div>
                <canvas id="tt-canvas" width="500" height="350" style="border:2px solid #38bdf8; border-radius:12px; background:#0f172a; cursor:pointer; max-width:100%;"></canvas>
            </div>
        `;
        this.canvas = document.getElementById('tt-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.statusEl = document.getElementById('tt-status');

        this.canvas.onclick = (e) => this.handleClick(e);
    }

    nextRound() {
        if (this.round > this.maxRounds) {
            if (this.animId) cancelAnimationFrame(this.animId);
            this.onGameOver(this.score);
            return;
        }

        const ballCount = 6 + this.round;
        const targetCount = 2 + Math.floor(this.round / 2);

        this.balls = [];
        for (let i = 0; i < ballCount; i++) {
            this.balls.push({
                id: i,
                x: Math.random() * (this.canvas.width - 40) + 20,
                y: Math.random() * (this.canvas.height - 40) + 20,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                radius: 16,
                isTarget: i < targetCount
            });
        }

        this.targets = this.balls.filter(b => b.isTarget).map(b => b.id);
        this.selected = [];
        this.state = 'study';
        this.statusEl.innerText = `Yeşil Hedef Topları Takip Et! (${this.round}/${this.maxRounds})`;

        this.startLoop();

        setTimeout(() => {
            this.state = 'tracking';
            this.statusEl.innerText = 'Hedefleri Takip Et!';
            setTimeout(() => {
                this.state = 'guess';
                this.statusEl.innerText = 'Hedef Olan Toplara Tıkla!';
            }, 4000);
        }, 2000);
    }

    startLoop() {
        const update = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.balls.forEach(b => {
                if (this.state === 'tracking' || this.state === 'study' || this.state === 'guess') {
                    b.x += b.vx;
                    b.y += b.vy;

                    if (b.x - b.radius < 0 || b.x + b.radius > this.canvas.width) b.vx *= -1;
                    if (b.y - b.radius < 0 || b.y + b.radius > this.canvas.height) b.vy *= -1;
                }

                this.ctx.beginPath();
                this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);

                if (this.state === 'study' && b.isTarget) {
                    this.ctx.fillStyle = '#22c55e';
                } else if (this.state === 'guess' && this.selected.includes(b.id)) {
                    this.ctx.fillStyle = '#f59e0b';
                } else {
                    this.ctx.fillStyle = '#38bdf8';
                }

                this.ctx.fill();
                this.ctx.lineWidth = 2;
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.stroke();
            });

            this.animId = requestAnimationFrame(update);
        };
        if (this.animId) cancelAnimationFrame(this.animId);
        update();
    }

    handleClick(e) {
        if (this.state !== 'guess') return;

        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const clickedBall = this.balls.find(b => {
            const dist = Math.hypot(b.x - clickX, b.y - clickY);
            return dist <= b.radius;
        });

        if (clickedBall && !this.selected.includes(clickedBall.id)) {
            this.selected.push(clickedBall.id);

            if (this.selected.length === this.targets.length) {
                const correctCount = this.selected.filter(id => this.targets.includes(id)).length;
                if (correctCount === this.targets.length) {
                    this.score += 250;
                    this.playSound('correct');
                } else {
                    this.score += correctCount * 50;
                    this.playSound('wrong');
                }
                this.onScore(this.score);
                this.round++;
                setTimeout(() => this.nextRound(), 1000);
            }
        }
    }
}
window.TargetTrackerGame = TargetTrackerGame;