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
      <div class="modal-panel" style="max-width:400px">
        <h2>ROOM HISTORY</h2>
        <div class="history-list"></div>
        <button class="secondary" id="history-back" style="width:100%;padding:14px;border-radius:10px;margin-top:8px">BACK</button>
      </div>
    `;
    this.container.appendChild(this.el);

    const list = this.el.querySelector('.history-list');

    if (history.length === 0) {
      list.innerHTML = '<div style="text-align:center;color:#6b7280;font-size:13px;padding:20px">Belum ada room.</div>';
    } else {
      // Cek status room masih ada atau tidak
      for (const h of history) {
        const card = document.createElement('div');
        card.className = 'history-room';
        card.innerHTML = `
          <div class="history-name">${h.roomName || 'Room'}</div>
          <div class="history-code">${h.code}</div>
          <div class="history-status">Cek...</div>
          <button class="history-join">JOIN</button>
        `;
        list.appendChild(card);

        // Cek apakah room masih ada
        const { data } = await supabase
          .from('rooms').select('id, status, name')
          .eq('code', h.code).limit(1);

        const statusEl = card.querySelector('.history-status');
        const joinBtn = card.querySelector('.history-join');

        if (data && data.length > 0) {
          const room = data[0];
          if (room.status === 'lobby') {
            statusEl.textContent = 'Masih tersedia';
            statusEl.style.color = '#6ee7b7';
            joinBtn.disabled = false;
            joinBtn.addEventListener('click', () => {
              this.hide();
              this.onSelect(h.code);
            });
          } else if (room.status === 'playing') {
            statusEl.textContent = 'Sedang bermain';
            statusEl.style.color = '#fbbf24';
            joinBtn.disabled = false;
            joinBtn.addEventListener('click', () => {
              this.hide();
              this.onSelect(h.code);
            });
          } else {
            statusEl.textContent = 'Sudah berakhir';
            statusEl.style.color = '#ef4444';
            joinBtn.disabled = true;
          }
        } else {
          statusEl.textContent = 'Tidak ditemukan';
          statusEl.style.color = '#ef4444';
          joinBtn.disabled = true;
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
