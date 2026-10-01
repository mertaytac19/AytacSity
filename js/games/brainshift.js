class BrainShiftGame {
    constructor(container, callbacks = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.onGameOver = callbacks.onGameOver || function () { };
        this.onScore = callbacks.onScore || function () { };
        this.playSound = callbacks.playSound || function () { };
        this.score = 0;
        this.round = 1;
        this.maxRounds = 8;
        this.vowels = ['A', 'E', 'I', 'O', 'U'];
        this.consonants = ['B', 'C', 'D', 'F', 'G'];
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
        const isTop = Math.random() > 0.5;
        const letter = Math.random() > 0.5 ? this.vowels[Math.floor(Math.random() * 5)] : this.consonants[Math.floor(Math.random() * 5)];
        const num = Math.floor(Math.random() * 8) + 1;
        const pair = `${letter}${num}`;

        let ruleText = isTop ? "Üst Kutu: SAYI ÇİFT Mİ?" : "Alt Kutu: HARF SESLİ Mİ?";
        let topBox = isTop ? `<div style="font-size:36px; font-weight:bold; color:#38bdf8; margin:20px;">${pair}</div>` : `<div style="height:50px;"></div>`;
        let bottomBox = !isTop ? `<div style="font-size:36px; font-weight:bold; color:#f43f5e; margin:20px;">${pair}</div>` : `<div style="height:50px;"></div>`;

        this.container.innerHTML = `
            <div style="text-align:center; padding:20px; color:#fff;">
                <h3 style="color:#f59e0b; margin-bottom:10px;">${ruleText}</h3>
                <div style="border:2px solid #334155; border-radius:12px; background:#0f172a; padding:10px; max-width:280px; margin:0 auto;">
                    ${topBox}
                    <hr style="border:1px dashed #334155;">
                    ${bottomBox}
                </div>
                <div style="margin-top:20px;">
                    <button id="bs-yes" style="padding:12px 30px; margin:10px; font-size:18px; font-weight:bold; background:#22c55e; border:none; border-radius:8px; color:#fff; cursor:pointer;">EVET</button>
                    <button id="bs-no" style="padding:12px 30px; margin:10px; font-size:18px; font-weight:bold; background:#ef4444; border:none; border-radius:8px; color:#fff; cursor:pointer;">HAYIR</button>
                </div>
            </div>
        `;

        const isEven = num % 2 === 0;
        const isVowel = this.vowels.includes(letter);
        const correctAnswer = isTop ? isEven : isVowel;

        const handleAns = (ans) => {
            if (ans === correctAnswer) {
                this.score += 150;
                this.playSound('correct');
                this.onScore(this.score);
            } else {
                this.playSound('wrong');
            }
            this.round++;
            this.nextRound();
        };

        document.getElementById('bs-yes').onclick = () => handleAns(true);
        document.getElementById('bs-no').onclick = () => handleAns(false);
    }
}
window.BrainShiftGame = BrainShiftGame;