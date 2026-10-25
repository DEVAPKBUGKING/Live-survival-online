import './style.css';
import { supabase } from './config/supabase.js';
import { Game } from './game/Game.js';
import { MainMenu } from './ui/MainMenu.js';
import { LoginUI } from './ui/LoginUI.js';
import { CreateRoom } from './ui/CreateRoom.js';
import { JoinRoom } from './ui/JoinRoom.js';
import { HistoryRooms } from './ui/HistoryRooms.js';
import { Rooms } from './multiplayer/Rooms.js';

const app = document.getElementById('app');
const rooms = new Rooms();

// Cek sesi login saat halaman dibuka
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    loadProfileAndMenu(session.user);
  } else {
    showLogin();
  }
});

function showLogin() {
  const login = new LoginUI(app, (user) => {
    loadProfileAndMenu(user);
  });
  login.show();
}

async function loadProfileAndMenu(user) {
  // Ambil data profil (uang, ktp, admin) dari database
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    alert('Gagal memuat profil: ' + (error?.message || 'Data tidak ditemukan'));
    return;
  }

  const menu = new MainMenu(app, {
    onPlay: () => showHistory(profile),
    onCreate: () => showCreateRoom(profile),
    onJoin: () => showJoinRoom(profile),
    onSettings: () => {
      if (confirm('Apakah kamu ingin logout?')) {
        supabase.auth.signOut().then(() => location.reload());
      }
    }
  });
  menu.show();
}

function showHistory(profile) {
  const history = new HistoryRooms(app,
    async (code) => {
      try {
        await rooms.joinRoom({ code, name: profile.username || 'Player' });
        enterWorld(profile);
      } catch (e) {
        alert(e.message);
      }
    },
    () => location.reload()
  );
  history.show();
}

function showCreateRoom(profile) {
  const screen = new CreateRoom(app,
    async ({ name, roomName, maxPlayers }) => {
      await rooms.createRoom({ name, roomName, maxPlayers });
      enterWorld(profile);
    },
    () => location.reload()
  );
  screen.show();
}

function showJoinRoom(profile) {
  const screen = new JoinRoom(app,
    async ({ code, name }) => {
      await rooms.joinRoom({ code, name });
      enterWorld(profile);
    },
    () => location.reload()
  );
  screen.show();
}

async function enterWorld(profile) {
  showLoading();
  await new Promise(r => setTimeout(r, 30));

  window.__rooms = rooms;
  const game = new Game(app, profile); // Oper data profil ke Game
  window.__game = game;

  try {
    await game.start((p, label) => updateLoading(p, label));
    await new Promise(r => setTimeout(r, 200));
    hideLoading();
  } catch (err) {
    console.error(err);
    updateLoading(1, 'Error: ' + err.message);
  }
}

// UI Loading
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
