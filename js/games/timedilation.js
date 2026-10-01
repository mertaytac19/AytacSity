class TimeDilationGame extends BaseGame {
  constructor(engine) {
    super(engine);
    this.events = [];
  }

  onStart() {
    this.mount.innerHTML = `<div class="time-stage" style="text-align:center; padding:20px;">
      <p>Olayları oluş sırasına göre yukarıdan aşağıya sürükle</p>
      <div id="time-timelines" style="margin:20px 0;"></div>
      <button id="time-submit" class="btn-primary">Sıralamayı Onayla</button>
    </div>`;
    
    document.getElementById('time-submit').addEventListener('click', () => this.checkOrder());
    this.nextRound();
  }

  nextRound() {
    this.roundStartTime = performance.now();
    this.events = [];
    for (let i = 0; i < 4; i++) {
      this.events.push({ id: i, name: `Olay ${i + 1}`, time: Math.random() * 10 });
    }
    
    const container = document.getElementById('time-timelines');
    container.innerHTML = this.events.map(e => `
      <div class="timeline-event" draggable="true" data-id="${e.id}" style="padding:15px; background:rgba(255,255,255,0.1); margin:5px 0; border-radius:8px; cursor:grab;">
        ${e.name}
      </div>
    `).join('');

    // Basit sürükle bırak mantığı
    let dragged = null;
    container.querySelectorAll('.timeline-event').forEach(el => {
      el.addEventListener('dragstart', () => { dragged = el; el.style.opacity = '0.5'; });
      el.addEventListener('dragend', () => { el.style.opacity = '1'; dragged = null; });
      el.addEventListener('dragover', e => {
        e.preventDefault();
        if (dragged && dragged !== el) {
          const rect = el.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          if (e.clientY < midY) container.insertBefore(dragged, el);
          else container.insertBefore(dragged, el.nextSibling);
        }
      });
    });
    this.setRule("Olayları zaman sırasına göre diz");
  }

  checkOrder() {
    const order = Array.from(document.getElementById('time-timelines').children).map(e => parseInt(e.getAttribute('data-id')));
    const correct = [...this.events].sort((a, b) => a.time - b.time).map(e => e.id);
    const isCorrect = order.every((id, idx) => id === correct[idx]);
    
    if (isCorrect) {
      this.reportSuccess(180, Math.round(performance.now() - this.roundStartTime));
      this.gameTimeout(() => this.nextRound(), 500);
    } else {
      this.reportError("Yanlış sıralama!");
    }
  }
  onDestroy() {}
}
window.TimeDilationGame = TimeDilationGame;