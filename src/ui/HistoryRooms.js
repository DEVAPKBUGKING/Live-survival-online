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
    this.el.style.cssText = `
      position: fixed; inset: 0; z-index: 10000; background: #0a0a12;
      display: flex; align-items: center; justify-content: center; padding: 24px; font-family: sans-serif;
    `;
    this.el.innerHTML = `
      <div style="width: 100%; max-width: 400px; background: #14142a; border: 1px solid #2a2a40; border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 16px;">
        <h2 style="color: #6ee7b7; text-align: center; letter-spacing: 2px; margin: 0;">ROOM HISTORY</h2>
        <div id="history-list" style="display: flex; flex-direction: column; gap: 10px; max-height: 50vh; overflow-y: auto;"></div>
        <button id="history-back" style="width: 100%; padding: 14px; border-radius: 10px; border: 1px solid #2a2a40; background: rgba(40,40,60,0.8); color: #fff; font-weight: bold; cursor: pointer;">BACK</button>
      </div>
    `;
    document.body.appendChild(this.el);

    const list = this.el.querySelector('#history-list');

    if (history.length === 0) {
      list.innerHTML = '<div style="text-align:center;color:#6b7280;font-size:13px;padding:20px">Belum ada room.</div>';
    } else {
      for (const h of history) {
        const card = document.createElement('div');
        card.style.cssText = `display: flex; align-items: center; justify-content: space-between; background: rgba(30,30,50,0.8); border: 1px solid #2a2a40; border-radius: 10px; padding: 12px; gap: 12px;`;
        card.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="color: #e8e8f0; font-size: 14px; font-weight: 700;">${h.roomName || 'Room'}</div>
            <div style="color: #6ee7b7; font-family: monospace; font-size: 16px; font-weight: 800;">${h.code}</div>
          </div>
          <button class="join-btn" disabled style="padding: 10px 16px; border-radius: 8px; border: 1px solid #3b82f6; background: rgba(59,130,246,0.2); color: #60a5fa; font-size: 12px; font-weight: 700; cursor: default; opacity: 0.3;">JOIN</button>
        `;
        list.appendChild(card);

        const joinBtn = card.querySelector('.join-btn');
        joinBtn.disabled = false;
        joinBtn.style.cursor = 'pointer';
        joinBtn.style.opacity = '1';
        joinBtn.addEventListener('click', () => {
          this.hide();
          this.onSelect(h.code);
        });
      }
    }

    this.el.querySelector('#history-back').addEventListener('click', () => {
      this.hide();
      this.onBack();
    });
  }

  hide() { if (this.el) { this.el.remove(); this.el = null; } }
}
