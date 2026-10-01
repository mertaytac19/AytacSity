class AnagramBurstGame {
    constructor(container, callbacks = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.onGameOver = callbacks.onGameOver || function () { };
        this.onScore = callbacks.onScore || function () { };
        this.playSound = callbacks.playSound || function () { };
        this.score = 0; this.round = 1; this.maxRounds = 5;
        this.words = [
            { scrambled: 'K-A-L-E-M', correct: 'KALEM' },
            { scrambled: 'B-İ-L-G-İ', correct: 'BİLGİ' },
            { scrambled: 'B-E-Y-İ-N', correct: 'BEYİN' }
        ];
    }
    start() { this.score = 0; this.round = 1; this.nextRound(); }
    nextRound() {
        if (this.round > this.maxRounds) return this.onGameOver(this.score);
        const w = this.words[(this.round - 1) % this.words.length];

        this.container.innerHTML = `
            <div style="text-align:center; padding:20px; color:#fff;">
                <h3>Hızlı Anagram (Kelime Bulma)</h3>
                <div style="font-size:32px; letter-spacing:4px; font-weight:bold; color:#f59e0b; margin:20px;">${w.scrambled}</div>
                <input type="text" id="ab-input" placeholder="Kelimeyi Yaz..." style="padding:10px; font-size:18px; text-align:center; border-radius:8px; border:none; margin-bottom:15px; text-transform:uppercase;">
                <br>
                <button id="ab-submit" style="padding:10px 30px; font-weight:bold; background:#22c55e; border:none; border-radius:8px; color:#fff; cursor:pointer;">ONAYLA</button>
            </div>
        `;

        document.getElementById('ab-submit').onclick = () => {
            const val = document.getElementById('ab-input').value.trim().toUpperCase();
            if (val === w.correct) {
                this.score += 200; this.playSound('correct'); this.onScore(this.score);
            } else {
                this.playSound('wrong');
            }
            this.round++; this.nextRound();
        };
    }
}
window.AnagramBurstGame = AnagramBurstGame;