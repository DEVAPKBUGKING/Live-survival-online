import { getPlayerName, setPlayerName } from '../config/supabase.js';

export class CreateRoom {
  constructor(container, onCreated, onCancel) {
    this.container = container;
    this.onCreated = onCreated;
    this.onCancel = onCancel;
    this.el = null;
  }

  show() {
    this.el = document.createElement('div');
    this.el.style.cssText = `position: fixed; inset: 0; z-index: 10000; background: #0a0a12; display: flex; align-items: center; justify-content: center; padding: 24px; font-family: sans-serif;`;
    this.el.innerHTML = `
      <div style="width: 100%; max-width: 360px; background: #14142a; border: 1px solid #2a2a40; border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 14px;">
        <h2 style="color: #6ee7b7; text-align: center; letter-spacing: 2px; margin: 0 0 8px 0; font-size: 18px;">CREATE ROOM</h2>
        
        <label style="display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: #9aa0b0; text-transform: uppercase;">
          Nama kamu
          <input id="cr-name" type="text" maxlength="16" placeholder="Player" value="${getPlayerName()}" style="padding: 12px; border: 1px solid #2a2a40; border-radius: 10px; background: #0a0a14; color: #e8e8f0; font-size: 15px; outline: none;" />
        </label>
        
        <label style="display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: #9aa0b0; text-transform: uppercase;">
          Nama room
          <input id="cr-roomname" type="text" maxlength="24" placeholder="My Room" style="padding: 12px; border: 1px solid #2a2a40; border-radius: 10px; background: #0a0a14; color: #e8e8f0; font-size: 15px; outline: none;" />
        </label>
        
        <label style="display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: #9aa0b0; text-transform: uppercase;">
          Maks pemain
          <select id="cr-max" style="padding: 12px; border: 1px solid #2a2a40; border-radius: 10px; background: #0a0a14; color: #e8e8f0; font-size: 15px; outline: none;">
            <option value="2">2</option><option value="4">4</option>
            <option value="6">6</option><option value="8" selected>8</option>
          </select>
        </label>
        
        <div id="cr-error" style="font-size: 12px; color: #ef4444; min-height: 16px;"></div>
        
        <div style="display: flex; gap: 10px; margin-top: 6px;">
          <button id="cr-cancel" style="flex: 1; padding: 14px; border-radius: 10px; border: 1px solid #2a2a40; background: rgba(40,40,60,0.8); color: #e8e8f0; font-weight: bold; cursor: pointer;">CANCEL</button>
          <button id="cr-create" style="flex: 1; padding: 14px; border-radius: 10px; border: 1px solid #3b82f6; background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; font-weight: bold; cursor: pointer;">CREATE</button>
        </div>
      </div>
    `;
    document.body.appendChild(this.el);

    this.el.querySelector('#cr-cancel').addEventListener('click', () => {
      this.hide(); this.onCancel();
    });

    this.el.querySelector('#cr-create').addEventListener('click', async () => {
      const name = this.el.querySelector('#cr-name').value.trim();
      const roomName = this.el.querySelector('#cr-roomname').value.trim();
      const maxPlayers = parseInt(this.el.querySelector('#cr-max').value, 10);
      const errEl = this.el.querySelector('#cr-error');
      const btn = this.el.querySelector('#cr-create');

      if (!name) { errEl.textContent = 'Nama wajib diisi.'; return; }
      if (!roomName) { errEl.textContent = 'Nama room wajib diisi.'; return; }

      setPlayerName(name);
      btn.disabled = true; btn.textContent = 'CREATING...'; errEl.textContent = '';
      try {
        await this.onCreated({ name, roomName, maxPlayers });
        this.hide();
      } catch (e) {
        errEl.textContent = e.message;
        btn.disabled = false; btn.textContent = 'CREATE';
      }
    });
  }

  hide() { if (this.el) { this.el.remove(); this.el = null; } }
}
