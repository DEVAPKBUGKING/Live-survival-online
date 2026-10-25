export class Lobby {
  constructor(container, rooms, { onStart, onLeave }) {
    this.container = container;
    this.rooms = rooms;
    this.onStart = onStart;
    this.onLeave = onLeave;
    this.el = null;
    this.unsubs = [];
    this.started = false;
  }

  async show() {
    this.el = document.createElement('div');
    this.el.id = 'lobby-screen';
    this.el.innerHTML = `
      <div class="lobby-panel">
        <div class="lobby-header">
          <div class="lobby-room-name"></div>
          <div class="lobby-code-row">
            <span class="lobby-code"></span>
            <button class="copy-code-btn">COPY</button>
          </div>
        </div>
        <div class="lobby-players">
          <div class="lobby-count"></div>
          <ul class="lobby-list"></ul>
        </div>
        <div class="lobby-actions">
          <button class="secondary" id="lobby-leave">LEAVE</button>
        </div>
        <div class="lobby-status">Menghubungkan...</div>
      </div>
    `;
    this.container.appendChild(this.el);

    const room = this.rooms.currentRoom;
    this.el.querySelector('.lobby-room-name').textContent = room.name;
    this.el.querySelector('.lobby-code').textContent = room.code;

    this.el.querySelector('#lobby-leave').addEventListener('click', async () => {
      await this.rooms.leaveRoom();
      this.hide();
      this.onLeave();
    });

    this.el.querySelector('.copy-code-btn').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(room.code);
        const b = this.el.querySelector('.copy-code-btn');
        b.textContent = 'COPIED';
        setTimeout(() => { if (this.el) b.textContent = 'COPY'; }, 1500);
      } catch {
        alert('Kode room: ' + room.code);
      }
    });

    await this.refresh();

    this.unsubs.push(this.rooms.on('players_changed', () => this.refresh()));
    this.unsubs.push(this.rooms.on('connection', (status) => {
      const s = this.el?.querySelector('.lobby-status');
      if (s) s.textContent = 'Realtime: ' + status;
      // Setelah channel connected, langsung masuk game
      if (status === 'SUBSCRIBED') {
        this.enterGame();
      }
    }));

    // Cadangan: kalau event SUBSCRIBED tidak terpicu dalam 2 detik, paksa masuk
    setTimeout(() => this.enterGame(), 2000);
  }

  enterGame() {
    if (this.started) return;
    this.started = true;
    this.hide();
    this.onStart({ startedAt: Date.now() });
  }

  async refresh() {
    if (!this.el) return;
    try {
      const players = await this.rooms.fetchPlayers();
      const list = this.el.querySelector('.lobby-list');
      const count = this.el.querySelector('.lobby-count');
      count.textContent = `${players.length} / ${this.rooms.currentRoom.max_players}`;

      list.innerHTML = '';
      for (const p of players) {
        const li = document.createElement('li');
        li.className = 'lobby-player' + (p.is_host ? ' host' : '');
        const nameEl = document.createElement('span');
        nameEl.className = 'player-name';
        nameEl.textContent = p.name;
        li.appendChild(nameEl);

        if (p.is_host) {
          const hb = document.createElement('span');
          hb.className = 'host-badge'; hb.textContent = 'HOST';
          li.appendChild(hb);
        }
        if (p.client_id === this.rooms.currentPlayer.client_id) {
          const yb = document.createElement('span');
          yb.className = 'you-badge'; yb.textContent = 'YOU';
          li.appendChild(yb);
        }
        list.appendChild(li);
      }
    } catch (e) { console.error(e); }
  }

  hide() {
    for (const u of this.unsubs) u();
    this.unsubs.length = 0;
    if (this.el) { this.el.remove(); this.el = null; }
  }
}
