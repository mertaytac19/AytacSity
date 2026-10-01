class SelectiveFocusGame {
    constructor(container, callbacks = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.onGameOver = callbacks.onGameOver || function () { };
        this.onScore = callbacks.onScore || function () { };
        this.playSound = callbacks.playSound || function () { };
        this.score = 0;
        this.round = 1;
        this.maxRounds = 5;
        this.icons = ['⭐', '🎈', '🚀', '⚽', '🎯', '💎', '🔥', '🎨'];
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
        const target = this.icons[Math.floor(Math.random() * this.icons.length)];
        const gridCount = 15;
        let items = [target];
        while (items.length < gridCount) {
            const rand = this.icons[Math.floor(Math.random() * this.icons.length)];
            if (rand !== target) items.push(rand);
        }
        items.sort(() => 0.5 - Math.random());

        let gridHtml = items.map(item => `
            <button class="sf-item" data-icon="${item}" style="font-size:32px; padding:10px; background:#1e293b; border:1px solid #334155; border-radius:8px; cursor:pointer;">${item}</button>
        `).join('');

        this.container.innerHTML = `
            <div style="text-align:center; padding:20px; color:#fff;">
                <h3>Hedef İkonu Bul: <span style="font-size:36px; vertical-align:middle;">${target}</span></h3>
                <p style="margin-bottom:15px;">Tur ${this.round}/${this.maxRounds}</p>
                <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:10px; max-width:350px; margin:0 auto;">${gridHtml}</div>
            </div>
        `;

        this.container.querySelectorAll('.sf-item').forEach(btn => {
            btn.onclick = (e) => {
                const icon = e.target.getAttribute('data-icon');
                if (icon === target) {
                    this.score += 150;
                    this.playSound('correct');
                    this.onScore(this.score);
                    this.round++;
                    this.nextRound();
                } else {
                    this.playSound('wrong');
                }
            };
        });
    }
}
window.SelectiveFocusGame = SelectiveFocusGame;