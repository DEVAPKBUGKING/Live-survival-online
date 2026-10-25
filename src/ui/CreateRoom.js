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
    this.el.id = 'create-room-screen';
    this.el.className = 'modal-screen';
    this.el.innerHTML = `
      <div class="modal-panel">
        <h2>CREATE ROOM</h2>
        <label class="form-label">Nama kamu
          <input id="cr-name" type="text" maxlength="16" placeholder="Player" value="${getPlayerName()}" />
        </label>
        <label class="form-label">Nama room
          <input id="cr-roomname" type="text" maxlength="24" placeholder="My Room" />
        </label>
        <label class="form-label">Maks pemain
          <select id="cr-max">
            <option value="2">2</option><option value="4">4</option>
            <option value="6">6</option><option value="8" selected>8</option>
          </select>
        </label>
        <div class="modal-error" id="cr-error"></div>
        <div class="modal-buttons">
          <button class="secondary" id="cr-cancel">CANCEL</button>
          <button class="primary" id="cr-create">CREATE</button>
        </div>
      </div>
    `;
    this.container.appendChild(this.el);

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
