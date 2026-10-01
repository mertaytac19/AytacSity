class SoundSequenceGame {
    constructor(container, callbacks = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.onGameOver = callbacks.onGameOver || function () { };
        this.onScore = callbacks.onScore || function () { };
        this.playSound = callbacks.playSound || function () { };
        this.sequence = [];
        this.userSeq = [];
        this.score = 0;
        this.colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308'];
    }
    start() {
        this.score = 0;
        this.sequence = [];
        this.nextRound();
    }
    nextRound() {
        this.userSeq = [];
        this.sequence.push(Math.floor(Math.random() * 4));
        this.playSequence();
    }
    playSequence() {
        this.render();
        let i = 0;
        const btns = this.container.querySelectorAll('.seq-btn');
        const timer = setInterval(() => {
            if (i >= this.sequence.length) {
                clearInterval(timer);
                return;
            }
            const idx = this.sequence[i];
            if (btns[idx]) {
                btns[idx].style.opacity = '1';
                btns[idx].style.transform = 'scale(1.1)';
                this.playSound('correct');
                setTimeout(() => {
                    btns[idx].style.opacity = '0.6';
                    btns[idx].style.transform = 'scale(1)';
                }, 300);
            }
            i++;
        }, 600);
    }
    render() {
        let html = '<div style="text-align:center; padding:20px; color:#fff;"><h3>Işık & Ses Sırası Hafızası</h3><p>Sırayı Aklında Tut ve Aynı Sırayla Tıkla!</p><div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; max-width:240px; margin:20px auto;">';
        this.colors.forEach((c, idx) => {
            html += `<button class="seq-btn" data-idx="${idx}" style="height:100px; border-radius:16px; border:none; background:${c}; opacity:0.6; cursor:pointer; transition:all 0.2s;"></button>`;
        });
        html += '</div></div>';
        this.container.innerHTML = html;
        this.container.querySelectorAll('.seq-btn').forEach(btn => {
            btn.onclick = (e) => {
                const idx = parseInt(e.target.getAttribute('data-idx'));
                this.userSeq.push(idx);
                this.playSound('correct');
                if (this.userSeq[this.userSeq.length - 1] !== this.sequence[this.userSeq.length - 1]) {
                    this.playSound('wrong');
                    this.onGameOver(this.score);
                    return;
                }
                if (this.userSeq.length === this.sequence.length) {
                    this.score += 200;
                    this.onScore(this.score);
                    setTimeout(() => this.nextRound(), 800);
                }
            };
        });
    }
}
window.SoundSequenceGame = SoundSequenceGame;