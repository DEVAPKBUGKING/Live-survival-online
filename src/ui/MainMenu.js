export class MainMenu {
  constructor(container, onPlay) {
    this.container = container;
    this.onPlay = onPlay;
    this.el = null;
  }

  show() {
    this.el = document.createElement('div');
    this.el.id = 'main-menu';
    this.el.innerHTML = `
      <div class="conn-status">
        <span class="conn-dot"></span>
        <span>Offline</span>
      </div>
      <div class="logo">LIFE SURVIVAL<br>ONLINE</div>
      <div class="subtitle">3D Multiplayer</div>
      <div class="menu-buttons">
        <button class="primary" data-action="play">PLAY</button>
        <button data-action="create">CREATE ROOM</button>
        <button data-action="join">JOIN ROOM</button>
        <button data-action="settings">SETTINGS</button>
      </div>
      <div class="version">v0.1.0 — Tahap 1</div>
    `;

    this.el.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'play') {
          this.onPlay('play');
        } else if (action === 'create' || action === 'join') {
          alert('Room system diimplementasikan di Tahap 2.');
        } else if (action === 'settings') {
          alert('Settings akan diimplementasikan nanti.');
        }
      });
    });

    this.container.appendChild(this.el);
  }

  hide() {
    if (this.el) { this.el.remove(); this.el = null; }
  }
}
