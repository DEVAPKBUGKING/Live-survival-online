import './style.css';
import { Game } from './game/Game.js';
import { MainMenu } from './ui/MainMenu.js';

const app = document.getElementById('app');

const menu = new MainMenu(app, async (mode) => {
  menu.hide();
  showLoading();

  // Beri kesempatan browser render loading screen sebelum kerja berat
  await new Promise(r => setTimeout(r, 30));

  const game = new Game(app);
  window.__game = game;

  try {
    await game.start((progress, label) => updateLoading(progress, label));
    // Fade out loading setelah frame pertama tampil
    await new Promise(r => setTimeout(r, 250));
    hideLoading();
  } catch (err) {
    console.error(err);
    updateLoading(1, 'Error: ' + err.message);
  }
});

menu.show();

// ---------- Loading screen ----------
let loadingEl = null;
let loadingBar = null;
let loadingLabel = null;

function showLoading() {
  loadingEl = document.createElement('div');
  loadingEl.id = 'loading-screen';
  loadingEl.innerHTML = `
    <div class="loading-content">
      <div class="loading-logo">LIFE SURVIVAL<br>ONLINE</div>
      <div class="loading-bar-track">
        <div class="loading-bar-fill"></div>
      </div>
      <div class="loading-label">Memuat...</div>
    </div>
  `;
  app.appendChild(loadingEl);
  loadingBar = loadingEl.querySelector('.loading-bar-fill');
  loadingLabel = loadingEl.querySelector('.loading-label');
}

function updateLoading(progress, label) {
  if (loadingBar) loadingBar.style.width = Math.round(progress * 100) + '%';
  if (loadingLabel && label) loadingLabel.textContent = label;
}

function hideLoading() {
  if (!loadingEl) return;
  loadingEl.classList.add('fade-out');
  setTimeout(() => {
    loadingEl?.remove();
    loadingEl = null;
  }, 400);
}
