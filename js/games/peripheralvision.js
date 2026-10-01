class PeripheralVisionGame extends BaseGame {
  constructor(engine) {
    super(engine);
    this.targetPosition = null;
    this.distractors = [];
  }

  onStart() {
    this.renderStage();
    this.nextRound();
  }

  renderStage() {
    this.mount.innerHTML = `
      <div class="peripheral-stage" style="text-align:center; padding:20px;">
        <h3>Çevresel Görüş</h3>
        <p>Merkeze bak ve hedefi çevrede bul!</p>
        <div id="peripheral-grid" style="position:relative; width:100%; height:400px; background:rgba(0,0,0,0.3); border-radius:10px; margin:20px 0; overflow:hidden;"></div>
      </div>
    `;
  }

  nextRound() {
    this.roundStartTime = performance.now();
    
    // Hedef pozisyonu (kenarlarda)
    const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center', 'left-center', 'right-center'];
    this.targetPosition = positions[Math.floor(Math.random() * positions.length)];
    
    const grid = document.getElementById('peripheral-grid');
    grid.innerHTML = '';
    
    // Merkezdeki sabit nokta (bakış noktası)
    const centerDot = document.createElement('div');
    centerDot.style.cssText = `
      position:absolute;
      left:50%;
      top:50%;
      transform:translate(-50%, -50%);
      width:20px;
      height:20px;
      background:#fff;
      border-radius:50%;
      z-index:10;
    `;
    grid.appendChild(centerDot);
    
    // Hedef (renkli daire)
    const target = document.createElement('div');
    const targetColor = '#00f0ff';
    let posStyle = '';
    
    switch(this.targetPosition) {
      case 'top-left': posStyle = 'left:10%; top:10%;'; break;
      case 'top-right': posStyle = 'right:10%; top:10%;'; break;
      case 'bottom-left': posStyle = 'left:10%; bottom:10%;'; break;
      case 'bottom-right': posStyle = 'right:10%; bottom:10%;'; break;
      case 'top-center': posStyle = 'left:50%; top:10%; transform:translateX(-50%);'; break;
      case 'bottom-center': posStyle = 'left:50%; bottom:10%; transform:translateX(-50%);'; break;
      case 'left-center': posStyle = 'left:10%; top:50%; transform:translateY(-50%);'; break;
      case 'right-center': posStyle = 'right:10%; top:50%; transform:translateY(-50%);'; break;
    }
    
    target.style.cssText = `
      position:absolute;
      ${posStyle}
      width:40px;
      height:40px;
      background:${targetColor};
      border-radius:50%;
      cursor:pointer;
      box-shadow:0 0 20px ${targetColor};
    `;
    target.dataset.type = 'target';
    grid.appendChild(target);
    
    // Dikkat dağıtıcılar (gri daireler)
    for (let i = 0; i < 5; i++) {
      const distractor = document.createElement('div');
      const dx = Math.random() * 80 + 10;
      const dy = Math.random() * 80 + 10;
      
      // Hedefin üzerine gelmesin
      if (Math.abs(dx - parseFloat(posStyle.match(/left|right:(\d+)/)?.[1] || 50)) < 15 &&
          Math.abs(dy - parseFloat(posStyle.match(/top|bottom:(\d+)/)?.[1] || 50)) < 15) {
        i--;
        continue;
      }
      
      distractor.style.cssText = `
        position:absolute;
        left:${dx}%;
        top:${dy}%;
        width:30px;
        height:30px;
        background:rgba(255,255,255,0.3);
        border-radius:50%;
        cursor:pointer;
      `;
      distractor.dataset.type = 'distractor';
      grid.appendChild(distractor);
    }
    
    // Tıklama olayları
    grid.querySelectorAll('[data-type]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = el.dataset.type;
        const time = Math.round(performance.now() - this.roundStartTime);
        
        if (type === 'target') {
          this.reportSuccess(150, time);
          this.gameTimeout(() => this.nextRound(), 500);
        } else {
          this.reportError("Yanlış hedef!");
        }
      });
    });
    
    this.setRule("Merkeze bak ve MAVİ daireyi bul");
  }

  onDestroy() {
    this.targetPosition = null;
    this.distractors = [];
  }
}

window.PeripheralVisionGame = PeripheralVisionGame;