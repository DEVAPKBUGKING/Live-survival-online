export class MainMenu {
  constructor(container, actions) {
    this.container = container;
    this.actions = actions;
    this.el = null;
  }

  show() {
    this.el = document.createElement('div');
    this.el.id = 'main-menu';
    this.el.style.cssText = `
      position: fixed; inset: 0; z-index: 10000; background: #0a0a12;
      display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px;
    `;
    this.el.innerHTML = `
      <div style="font-size:32px; font-weight:800; letter-spacing:-0.5px; text-align:center; line-height:1.1; margin-bottom:8px; background: linear-gradient(135deg, #6ee7b7, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
        LIFE SURVIVAL<br>ONLINE
      </div>
      <div style="font-size:12px; color:#6b7280; letter-spacing:2px; text-transform:uppercase; margin-bottom:40px;">3D Multiplayer</div>
      
      <div style="display:flex; flex-direction:column; gap:12px; width:100%; max-width:280px;">
        <button id="btn-play" style="padding:16px 24px; border-radius:12px; background:linear-gradient(135deg, #3b82f6, #2563eb); border:1px solid #3b82f6; color:#fff; font-size:16px; font-weight:600; cursor:pointer;">PLAY</button>
        <button id="btn-create" style="padding:16px 24px; border-radius:12px; background:rgba(30,30,50,0.8); border:1px solid #2a2a40; color:#e8e8f0; font-size:16px; font-weight:600; cursor:pointer;">CREATE ROOM</button>
        <button id="btn-join" style="padding:16px 24px; border-radius:12px; background:rgba(30,30,50,0.8); border:1px solid #2a2a40; color:#e8e8f0; font-size:16px; font-weight:600; cursor:pointer;">JOIN ROOM</button>
        <button id="btn-settings" style="padding:16px 24px; border-radius:12px; background:rgba(30,30,50,0.8); border:1px solid #2a2a40; color:#e8e8f0; font-size:16px; font-weight:600; cursor:pointer;">SETTINGS</button>
      </div>
      
      <div style="position:absolute; bottom:24px; font-size:11px; color:#4b5563;">v0.4.0 — Optimized Engine</div>
    `;

    this.el.querySelector('#btn-play').addEventListener('click', () => this.actions.onPlay());
    this.el.querySelector('#btn-create').addEventListener('click', () => this.actions.onCreate());
    this.el.querySelector('#btn-join').addEventListener('click', () => this.actions.onJoin());
    this.el.querySelector('#btn-settings').addEventListener('click', () => this.actions.onSettings());

    document.body.appendChild(this.el);
  }

  hide() { if (this.el) { this.el.remove(); this.el = null; } }
}
