import { supabase } from '../config/supabase.js';

export class HistoryRooms {
  constructor(container, onSelect, onBack) {
    this.container = container;
    this.onSelect = onSelect;
    this.onBack = onBack;
    this.el = null;
  }

  async show() {
    const history = JSON.parse(localStorage.getItem('lso_room_history') || '[]');

    this.el = document.createElement('div');
    this.el.id = 'history-screen';
    this.el.className = 'modal-screen';
    this.el.innerHTML = `
      <div class="modal-panel">
        <h2>ROOM HISTORY</h2>
        <div class="history-list"></div>
        <div class="modal-buttons" style="margin-top: 16px;">
          <button class="secondary" id="history-back" style="width: 100%;">BACK</button>
        </div>
      </div>
    `;
    this.container.appendChild(this.el);

    const list = this.el.querySelector('.history-list');

    if (history.length === 0) {
      list.innerHTML = '<div style="text-align:center;color:#6b7280;font-size:13px;padding:20px">Belum ada room yang pernah di-join.</div>';
    } else {
      for (const h of history) {
        const card = document.createElement('div');
        card.className = 'history-room';
        card.innerHTML = `
          <div class="history-info">
            <div class="history-name">${h.roomName || 'Room'}</div>
            <div class="history-code">${h.code}</div>
            <div class="history-status">Cek status...</div>
          </div>
          <button class="history-join" disabled>JOIN</button>
        `;
        list.appendChild(card);

        const statusEl = card.querySelector('.history-status');
        const joinBtn = card.querySelector('.history-join');

        // Cek apakah room masih ada di database
        const { data } = await supabase
          .from('rooms').select('id, status')
          .eq('code', h.code).limit(1);

        if (data && data.length > 0) {
          const room = data[0];
          if (room.status === 'lobby' || room.status === 'playing') {
            statusEl.textContent = 'Tersedia';
            statusEl.style.color = '#6ee7b7';
            joinBtn.disabled = false;
            joinBtn.addEventListener('click', () => {
              this.hide();
              this.onSelect(h.code);
            });
          } else {
            statusEl.textContent = 'Sudah berakhir';
            statusEl.style.color = '#ef4444';
          }
        } else {
          statusEl.textContent = 'Tidak ditemukan';
          statusEl.style.color = '#ef4444';
        }
      }
    }

    this.el.querySelector('#history-back').addEventListener('click', () => {
      this.hide();
      this.onBack();
    });
  }

  hide() { if (this.el) { this.el.remove(); this.el = null; } }
}
