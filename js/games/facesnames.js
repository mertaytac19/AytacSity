class FacesNamesGame {
    constructor(container, callbacks = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.onGameOver = callbacks.onGameOver || function () { };
        this.onScore = callbacks.onScore || function () { };
        this.playSound = callbacks.playSound || function () { };

        this.avatars = ['👨‍💼', '👩‍🔬', '👨‍🎨', '👩‍💻', '👨‍🍳', '👩‍🚀', '👨‍🚒', '👩‍‍⚖️', '👨‍🌾', '👩‍🎤'];
        this.names = ['Ahmet', 'Ayşe', 'Mehmet', 'Fatma', 'Can', 'Zeynep', 'Ali', 'Elif', 'Burak', 'Selin'];
        this.score = 0;
        this.round = 1;
        this.totalRounds = 5;
        this.studyTime = 4000;
    }

    start() {
        this.score = 0;
        this.round = 1;
        this.nextRound();
    }

    nextRound() {
        if (this.round > this.totalRounds) {
            this.onGameOver(this.score);
            return;
        }

        const shuffledAvatars = [...this.avatars].sort(() => 0.5 - Math.random());
        const shuffledNames = [...this.names].sort(() => 0.5 - Math.random());
        const pairCount = Math.min(3 + Math.floor(this.round / 2), 6);

        this.pairs = [];
        for (let i = 0; i < pairCount; i++) {
            this.pairs.push({ avatar: shuffledAvatars[i], name: shuffledNames[i] });
        }

        this.renderStudyPhase();
    }

    renderStudyPhase() {
        let cardsHtml = this.pairs.map(p => `
            <div style="display:inline-block; margin:10px; padding:15px; border:2px solid #3b82f6; border-radius:12px; background:#f8fafc; text-align:center; min-width:90px;">
                <div style="font-size:48px;">${p.avatar}</div>
                <div style="font-weight:bold; font-size:18px; color:#1e293b; margin-top:5px;">${p.name}</div>
            </div>
        `).join('');

        this.container.innerHTML = `
            <div style="text-align:center; padding:20px; color:#fff;">
                <h3>Hafıza Aşaması (Tur ${this.round}/${this.totalRounds})</h3>
                <p style="margin-bottom:15px;">Yüzleri ve isimleri aklında tut!</p>
                <div>${cardsHtml}</div>
                <div style="margin-top:15px; font-weight:bold; color:#f59e0b;">Görseller gizlenecek...</div>
            </div>
        `;

        setTimeout(() => {
            this.renderQuestionPhase();
        }, this.studyTime);
    }

    renderQuestionPhase() {
        const targetPair = this.pairs[Math.floor(Math.random() * this.pairs.length)];
        const options = [...this.pairs.map(p => p.name)].sort(() => 0.5 - Math.random());

        let optionsHtml = options.map(name => `
            <button class="fn-opt-btn" data-name="${name}" style="padding:12px 24px; margin:8px; font-size:16px; font-weight:bold; cursor:pointer; border-radius:8px; border:none; background:#3b82f6; color:#fff;">
                ${name}
            </button>
        `).join('');

        this.container.innerHTML = `
            <div style="text-align:center; padding:20px; color:#fff;">
                <h3>Bu Kişinin İsmi Ne?</h3>
                <div style="font-size:80px; margin:20px 0;">${targetPair.avatar}</div>
                <div>${optionsHtml}</div>
            </div>
        `;

        const btns = this.container.querySelectorAll('.fn-opt-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const selected = e.target.getAttribute('data-name');
                if (selected === targetPair.name) {
                    this.score += 200;
                    this.playSound('correct');
                    this.onScore(this.score);
                } else {
                    this.playSound('wrong');
                }
                this.round++;
                this.nextRound();
            });
        });
    }
}
window.FacesNamesGame = FacesNamesGame;