export class MainMenu {
  constructor(container, actions) {
    this.container = container;
    this.actions = actions;
    this.el = null;
  }

  show() {
    this.el = document.createElement('div');
    this.el.id = 'main-menu';
    this.el.innerHTML = `
      <div class="logo">LIFE SURVIVAL<br>ONLINE</div>
      <div class="subtitle">3D Multiplayer</div>
      <div class="menu-buttons">
        <button class="primary" data-action="play">PLAY</button>
        <button data-action="create">CREATE ROOM</button>
        <button data-action="join">JOIN ROOM</button>
        <button data-action="settings">SETTINGS</button>
      </div>
      <div class="version">v0.3.0 — Tahap 3</div>
    `;

    this.el.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const a = btn.dataset.action;
        if (a === 'play') this.actions.onPlay();
        else if (a === 'create') this.actions.onCreate();
        else if (a === 'join') this.actions.onJoin();
        else if (a === 'settings') this.actions.onSettings();
      });
    });

    this.container.appendChild(this.el);
  }

  hide() { if (this.el) { this.el.remove(); this.el = null; } }
}
