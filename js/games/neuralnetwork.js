class NeuralNetworkGame extends BaseGame {
  constructor(engine) {
    super(engine);
    this.nodes = [];
    this.connections = [];
    this.targetConnections = 5;
    this.round = 0;
  }

  onStart() {
    this.renderStage();
    this.nextRound();
  }

  renderStage() {
    this.mount.innerHTML = `
      <div class="neural-stage" style="text-align:center; padding: 20px;">
        <h3>Nöral Ağ Kurucusu</h3>
        <p>Düğümleri doğru şekilde bağla.</p>
        <div id="neural-canvas" style="width:100%; height:300px; background:rgba(255,255,255,0.05); border-radius:10px; position:relative; margin: 20px 0;"></div>
        <button id="btn-neural-reset" class="btn-primary">Sıfırla</button>
      </div>`;
    
    document.getElementById('btn-neural-reset').addEventListener('click', () => {
      this.connections = [];
      this.renderConnections();
    });
  }

  nextRound() {
    this.roundStartTime = performance.now();
    this.round++;
    this.nodes = [];
    this.connections = [];
    
    for (let i = 0; i < 6; i++) {
      this.nodes.push({ id: i, x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 });
    }
    this.renderNodes();
    this.setRule(`Bağlantı ${this.round}/${this.targetConnections}`);
  }

  renderNodes() {
    const canvas = document.getElementById('neural-canvas');
    if (!canvas) return;
    canvas.innerHTML = this.nodes.map(node => `
      <div class="neural-node" data-id="${node.id}" style="position:absolute; left:${node.x}%; top:${node.y}%; width:30px; height:30px; background:#00f0ff; border-radius:50%; cursor:pointer;"></div>
    `).join('');
    this.renderConnections();

    let selectedNode = null;
    canvas.querySelectorAll('.neural-node').forEach(node => {
      node.addEventListener('click', () => {
        const id = parseInt(node.getAttribute('data-id'));
        if (!selectedNode) {
          selectedNode = id;
          node.style.background = '#ffb703';
        } else {
          if (selectedNode !== id) this.addConnection(selectedNode, id);
          canvas.querySelectorAll('.neural-node').forEach(n => n.style.background = '#00f0ff');
          selectedNode = null;
        }
      });
    });
  }

  addConnection(from, to) {
    const exists = this.connections.some(c => (c.from === from && c.to === to) || (c.from === to && c.to === from));
    if (!exists) {
      this.connections.push({ from, to });
      this.renderConnections();
      if (this.connections.length >= this.targetConnections) {
        this.reportSuccess(150, Math.round(performance.now() - this.roundStartTime));
        this.gameTimeout(() => this.nextRound(), 500);
      }
    }
  }

  renderConnections() {
    const canvas = document.getElementById('neural-canvas');
    if (!canvas) return;
    const svg = `<svg style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;">
      ${this.connections.map(c => {
        const n1 = this.nodes[c.from], n2 = this.nodes[c.to];
        return `<line x1="${n1.x}%" y1="${n1.y}%" x2="${n2.x}%" y2="${n2.y}%" stroke="#00f0ff" stroke-width="2"/>`;
      }).join('')}
    </svg>`;
    canvas.insertAdjacentHTML('beforeend', svg);
  }

  onDestroy() {
    this.nodes = [];
    this.connections = [];
  }
}
window.NeuralNetworkGame = NeuralNetworkGame;