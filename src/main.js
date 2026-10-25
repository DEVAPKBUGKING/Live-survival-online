import './style.css';
import { Game } from './game/Game.js';
import { MainMenu } from './ui/MainMenu.js';
import { CreateRoom } from './ui/CreateRoom.js';
import { JoinRoom } from './ui/JoinRoom.js';
import { Lobby } from './ui/Lobby.js';
import { Rooms } from './multiplayer/Rooms.js';

const app = document.getElementById('app');
const rooms = new Rooms();

// ---------- Routing ----------
const menu = new MainMenu(app, {
  onPlay: () => alert('Gunakan CREATE ROOM atau JOIN ROOM untuk mulai multiplayer.'),
  onCreate: () => showCreateRoom(),
  onJoin: () => showJoinRoom(),
  onSettings: () => alert('Settings global akan ditambahkan nanti.')
});
menu.show();

function showCreateRoom() {
  menu.hide();
  const screen = new CreateRoom(app,
    async ({ name, roomName, maxPlayers }) => {
      await rooms.createRoom({ name, roomName, maxPlayers });
      screen.hide();
      showLobby();
    },
    () => { menu.show(); }
  );
  screen.show();
}

function showJoinRoom() {
  menu.hide();
  const screen = new JoinRoom(app,
    async ({ code, name }) => {
      await rooms.joinRoom({ code, name });
      screen.hide();
      showLobby();
    },
    () => { menu.show(); }
  );
  screen.show();
}

function showLobby() {
  const lobby = new Lobby(app, rooms, {
    onStart: async (payload) => {
      lobby.hide();
      await startGame(payload);
    },
    onLeave: () => { menu.show(); }
  });
  lobby.show();
}

async function startGame(payload) {
  showLoading();
  await new Promise(r => setTimeout(r, 30));

  const game = new Game(app);
  window.__game = game;
  window.__rooms = rooms;

  try {
    await game.start((p, label) => updateLoading(p, label));
    await new Promise(r => setTimeout(r, 250));
    hideLoading();
    console.log('[Tahap 2] Game dimulai. Rooms context:', rooms.currentRoom?.code);
  } catch (err) {
    console.error(err);
    updateLoading(1, 'Error: ' + err.message);
  }
}

// ---------- Loading ----------
let loadingEl = null, loadingBar = null, loadingLabel = null;

function showLoading() {
  loadingEl = document.createElement('div');
  loadingEl.id = 'loading-screen';
  loadingEl.innerHTML = `
    <div class="loading-content">
      <div class="loading-logo">LIFE SURVIVAL<br>ONLINE</div>
      <div class="loading-bar-track"><div class="loading-bar-fill"></div></div>
      <div class="loading-label">Memuat...</div>
    </div>
  `;
  app.appendChild(loadingEl);
  loadingBar = loadingEl.querySelector('.loading-bar-fill');
  loadingLabel = loadingEl.querySelector('.loading-label');
}

function updateLoading(p, label) {
  if (loadingBar) loadingBar.style.width = Math.round(p * 100) + '%';
  if (loadingLabel && label) loadingLabel.textContent = label;
}

function hideLoading() {
  if (!loadingEl) return;
  loadingEl.classList.add('fade-out');
  setTimeout(() => { loadingEl?.remove(); loadingEl = null; }, 400);
}
