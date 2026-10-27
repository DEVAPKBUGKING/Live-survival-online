import { getPlayerName, setPlayerName } from '../config/supabase.js';

export class JoinRoom {
  constructor(container, onJoined, onCancel) {
    this.container = container;
    this.onJoined = onJoined;
    this.onCancel = onCancel;
    this.el = null;
  }

  show() {
    this.el = document.createElement('div');
    this.el.style.cssText = `position: fixed; inset: 0; z-index: 10000; background: #0a0a12; display: flex; align-items: center; justify-content: center; padding: 24px; font-family: sans-serif;`;
    this.el.innerHTML = `
      <div style="width: 100%; max-width: 360px; background: #14142a; border: 1px solid #2a2a40; border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 14px;">
        <h2 style="color: #6ee7b7; text-align: center; letter-spacing: 2px; margin: 0 0 8px 0; font-size: 18px;">JOIN ROOM</h2>
        
        <label style="display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: #9aa0b0; text-transform: uppercase;">
          Nama kamu
          <input id="jr-name" type="text" maxlength="16" placeholder="Player" value="${getPlayerName()}" style="padding: 12px; border: 1px solid #2a2a40; border-radius: 10px; background: #0a0a14; color: #e8e8f0; font-size: 15px; outline: none;" />
        </label>
        
        <label style="display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: #9aa0b0; text-transform: uppercase;">
          Kode room
          <input id="jr-code" type="text" maxlength="6" placeholder="ABC123" style="padding: 12px; border: 1px solid #2a2a40; border-radius: 10px; background: #0a0a14; color: #e8e8f0; font-size: 18px; outline: none; font-family: monospace; text-transform: uppercase; letter-spacing: 6px; font-weight: 700; text-align: center;" />
        </label>
        
        <div id="jr-error" style="font-size: 12px; color: #ef4444; min-height: 16px;"></div>
        
        <div style="display: flex; gap: 10px; margin-top: 6px;">
          <button id="jr-cancel" style="flex: 1; padding: 14px; border-radius: 10px; border: 1px solid #2a2a40; background: rgba(40,40,60,0.8); color: #e8e8f0; font-weight: bold; cursor: pointer;">CANCEL</button>
          <button id="jr-join" style="flex: 1; padding: 14px; border-radius: 10px; border: 1px solid #3b82f6; background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; font-weight: bold; cursor: pointer;">JOIN</button>
        </div>
      </div>
    `;
    document.body.appendChild(this.el);

    this.el.querySelector('#jr-cancel').addEventListener('click', () => {
      this.hide(); this.onCancel();
    });

    this.el.querySelector('#jr-join').addEventListener('click', async () => {
      const name = this.el.querySelector('#jr-name').value.trim();
      const code = this.el.querySelector('#jr-code').value.trim().toUpperCase();
      const errEl = this.el.querySelector('#jr-error');
      const btn = this.el.querySelector('#jr-join');

      if (!name) { errEl.textContent = 'Nama wajib diisi.'; return; }
      if (code.length !== 6) { errEl.textContent = 'Kode harus 6 karakter.'; return; }

      setPlayerName(name);
      btn.disabled = true; btn.textContent = 'JOINING...'; errEl.textContent = '';
      try {
        await this.onJoined({ code, name });
        this.hide();
      } catch (e) {
        errEl.textContent = e.message;
        btn.disabled = false; btn.textContent = 'JOIN';
      }
    });
  }

  hide() { if (this.el) { this.el.remove(); this.el = null; } }
}
