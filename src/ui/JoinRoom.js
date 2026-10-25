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
    this.el.id = 'join-room-screen';
    this.el.className = 'modal-screen';
    this.el.innerHTML = `
      <div class="modal-panel">
        <h2>JOIN ROOM</h2>
        <label class="form-label">Nama kamu
          <input id="jr-name" type="text" maxlength="16" placeholder="Player" value="${getPlayerName()}" />
        </label>
        <label class="form-label">Kode room
          <input id="jr-code" type="text" maxlength="6" placeholder="ABC123"
                 style="text-transform:uppercase;letter-spacing:6px;font-weight:700;text-align:center" />
        </label>
        <div class="modal-error" id="jr-error"></div>
        <div class="modal-buttons">
          <button class="secondary" id="jr-cancel">CANCEL</button>
          <button class="primary" id="jr-join">JOIN</button>
        </div>
      </div>
    `;
    this.container.appendChild(this.el);

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
