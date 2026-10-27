export class Lobby {
  constructor(container, rooms, { onStart, onLeave }) {
    this.container = container;
    this.rooms = rooms;
    this.onStart = onStart;
    this.onLeave = onLeave;
    this.el = null;
    this.started = false;
  }

  async show() {
    this.el = document.createElement('div');
    this.el.id = 'lobby-screen';
    this.el.style.cssText = `position: fixed; inset: 0; z-index: 99999; background: #0a0a12; display: flex; align-items: center; justify-content: center; padding: 24px; font-family: sans-serif;`;
    
    const room = this.rooms.currentRoom;
    const isHost = this.rooms.currentPlayer.is_host;

    this.el.innerHTML = `
      <div style="width: 100%; max-width: 400px; background: #14142a; border: 1px solid #2a2a40; border-radius: 16px; padding: 24px; text-align: center;">
        <h2 style="color: #6ee7b7; letter-spacing: 2px; margin-bottom: 10px;">LOBBY</h2>
        <div style="font-size: 12px; color: #9aa0b0; margin-bottom: 20px;">${room.name}</div>
        
        <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
          <div style="font-size: 11px; color: #9aa0b0; margin-bottom: 5px;">KODE ROOM</div>
          <div style="font-size: 28px; font-weight: 800; color: #fbbf24; letter-spacing: 5px;">${room.code}</div>
        </div>

        <ul id="lobby-players" style="list-style: none; padding: 0; margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px;"></ul>

        <div style="display: flex; gap: 10px;">
          <button id="btn-leave" style="flex: 1; padding: 15px; border-radius: 10px; border: 1px solid #ef4444; background: rgba(239,68,68,0.2); color: #ef4444; font-weight: bold; cursor: pointer;">KELUAR</button>
          ${isHost ? `<button id="btn-start" style="flex: 1; padding: 15px; border-radius: 10px; border: 1px solid #3b82f6; background: #3b82f6; color: #fff; font-weight: bold; cursor: pointer;">MULAI</button>` : ''}
        </div>
      </div>
    `;
    document.body.appendChild(this.el);

    this.refreshPlayers();

    this.el.querySelector('#btn-leave').addEventListener('click', async () => {
      await this.rooms.leaveRoom();
      this.hide();
      this.onLeave();
    });

    if (isHost) {
      const startBtn = this.el.querySelector('#btn-start');
      startBtn.addEventListener('click', async () => {
        if (this.started) return;
        this.started = true;
        startBtn.innerText = 'MEMUAT...';
        
        await this.rooms.startGame();
        
        this.hide();
        this.onStart(); 
      });
    }

    this.unsubStart = this.rooms.on('start_game', () => {
      if (this.started) return;
      this.started = true;
      this.hide();
      this.onStart();
    });
  }

  async refreshPlayers() {
    if (!this.el) return;
    try {
      const players = await this.rooms.fetchPlayers();
      const list = this.el.querySelector('#lobby-players');
      if (!list) return;
      list.innerHTML = players.map(p => `
        <li style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; display: flex; justify-content: space-between; font-size: 14px;">
          <span>${p.name} ${p.is_host ? '👑' : ''}</span>
          <span style="color: #6ee7b7;">Siap</span>
        </li>
      `).join('');
    } catch(e) {}
  }

  hide() { 
    if (this.unsubStart) this.unsubStart();
    if (this.el) { this.el.remove(); this.el = null; } 
  }
}
