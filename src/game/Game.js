import * as THREE from 'three';
import { World } from './World.js';
import { Controls } from './Controls.js';
import { Collision } from './Collision.js';
import { PlayerSync } from '../multiplayer/PlayerSync.js';
import { Inventory } from './Inventory.js';
import { InventoryUI } from '../ui/InventoryUI.js';

export class Game {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.world = null;
    this.controls = null;
    this.collision = new Collision();
    this.playerSync = null;
    this.inventory = null;
    this.inventoryUI = null;
    this.running = false;
    this.paused = false;
    this.clock = new THREE.Clock();
    this.hudEl = null;
    this.pauseEl = null;
    this.joyValue = { x: 0, y: 0 };
    this.isFullscreen = false;
    this.unsubs = [];

    // Per-zone touch identifier tracking
    this.joyTouchId = null;
    this.lookTouchId = null;
    this.joyCenter = { x: 0, y: 0 };
    this.lastLook = { x: 0, y: 0 };
    this.joyRadius = 50;

    this.knownPlayers = new Set();
  }

  async start(onProgress) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x9dc8e8);
    this.scene.fog = new THREE.Fog(0x9dc8e8, 50, 120);

    this.camera = new THREE.PerspectiveCamera(
      72, window.innerWidth / window.innerHeight, 0.1, 250
    );
    this.camera.position.set(0, 1.6, 0);
    this.camera.rotation.order = 'YXZ';

    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.container.appendChild(this.renderer.domElement);

    if (onProgress) onProgress(0.1, 'Menyiapkan renderer');
    await new Promise(r => setTimeout(r, 0));

    this.world = new World(this.scene, this.collision);
    await this.world.build((p, label) => {
      if (onProgress) onProgress(0.1 + p * 0.7, label);
    });

    this.controls = new Controls(this.camera, this.renderer.domElement, this.collision);
    this.controls.enable();
    this.controls.setJoystick(this.joyValue);

    this.inventory = new Inventory();
    this.inventory.add('water', 3);
    this.inventory.add('bread', 2);
    this.inventory.add('medkit', 1);

    if (onProgress) onProgress(0.9, 'Menyiapkan kontrol');
    await new Promise(r => setTimeout(r, 0));

    this.createHUD();

    if (window.__rooms && window.__rooms.currentRoom) {
      this.playerSync = new PlayerSync(this.scene, this.camera, window.__rooms);

      try {
        const existing = await window.__rooms.fetchPlayers();
        for (const p of existing) {
          if (p.client_id !== window.__rooms.currentPlayer.client_id) {
            this.knownPlayers.add(p.client_id);
          }
        }
      } catch {}

      this.unsubs.push(window.__rooms.on('players_changed_db', (payload) => {
        if (payload.eventType === 'INSERT') {
          const p = payload.new;
          if (p.client_id === window.__rooms.currentPlayer.client_id) return;
          if (this.knownPlayers.has(p.client_id)) return;
          this.knownPlayers.add(p.client_id);
          this.showToast(`${p.name} telah join ke server`);
        } else if (payload.eventType === 'DELETE') {
          this.knownPlayers.delete(payload.old.client_id);
        }
      }));
    }

    this.onResize = () => this.handleResize();
    window.addEventListener('resize', this.onResize);

    this.onFsChange = () => {
      this.isFullscreen = !!document.fullscreenElement;
      this.updateFullscreenBtn();
    };
    document.addEventListener('fullscreenchange', this.onFsChange);

    this.renderer.render(this.scene, this.camera);
    if (onProgress) onProgress(1, 'Selesai');

    this.running = true;
    this.animate();
  }

  createHUD() {
    // ---- Game HUD (joystick + look + toast) ----
    this.hudEl = document.createElement('div');
    this.hudEl.id = 'game-hud';
    this.hudEl.classList.add('active');
    this.hudEl.innerHTML = `
      <div id="crosshair"></div>
      <div id="joystick-zone"></div>
      <div id="joystick-base"><div id="joystick-knob"></div></div>
      <div id="look-zone"></div>
      <div id="toast-container"></div>
    `;
    this.container.appendChild(this.hudEl);

    // ---- HUD buttons (sibling, di luar game-hud) ----
    this.buttonsEl = document.createElement('div');
    this.buttonsEl.id = 'hud-buttons';
    this.buttonsEl.innerHTML = `
      <button id="btn-inventory" title="Inventory">🎒</button>
      <button id="btn-fullscreen" title="Fullscreen">⛶</button>
      <button id="btn-settings" title="Settings">⚙</button>
    `;
    this.container.appendChild(this.buttonsEl);

    this.setupJoystick();
    this.setupLookZone();

    this.buttonsEl.querySelector('#btn-inventory').addEventListener('click', (e) => {
      e.stopPropagation();
      this.openInventory();
    });
    this.buttonsEl.querySelector('#btn-fullscreen').addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleFullscreen();
    });
    this.buttonsEl.querySelector('#btn-settings').addEventListener('click', (e) => {
      e.stopPropagation();
      this.openPauseMenu();
    });
  }

  setupJoystick() {
    const zone = this.hudEl.querySelector('#joystick-zone');
    const base = this.hudEl.querySelector('#joystick-base');
    const knob = this.hudEl.querySelector('#joystick-knob');

    const updateKnob = (dx, dy) => {
      const dist = Math.hypot(dx, dy);
      const clamped = Math.min(dist, this.joyRadius);
      const angle = Math.atan2(dy, dx);
      const kx = Math.cos(angle) * clamped;
      const ky = Math.sin(angle) * clamped;
      knob.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;
      this.joyValue.x = kx / this.joyRadius;
      this.joyValue.y = ky / this.joyRadius;
    };

    zone.addEventListener('touchstart', (e) => {
      if (this.paused) return;
      if (this.joyTouchId !== null) return;
      const t = e.changedTouches[0];
      this.joyTouchId = t.identifier;
      this.joyCenter.x = t.clientX;
      this.joyCenter.y = t.clientY;
      base.style.position = 'fixed';
      base.style.left = (t.clientX - this.joyRadius) + 'px';
      base.style.top = (t.clientY - this.joyRadius) + 'px';
      base.classList.add('active');
      updateKnob(0, 0);
      e.preventDefault();
    }, { passive: false });

    zone.addEventListener('touchmove', (e) => {
      if (this.paused || this.joyTouchId === null) return;
      for (const t of e.changedTouches) {
        if (t.identifier === this.joyTouchId) {
          updateKnob(t.clientX - this.joyCenter.x, t.clientY - this.joyCenter.y);
          e.preventDefault();
          break;
        }
      }
    }, { passive: false });

    const endJoy = (e) => {
      if (this.joyTouchId === null) return;
      for (const t of e.changedTouches) {
        if (t.identifier === this.joyTouchId) {
          this.joyTouchId = null;
          this.joyValue.x = 0;
          this.joyValue.y = 0;
          base.classList.remove('active');
          knob.style.transform = 'translate(-50%, -50%)';
          break;
        }
      }
    };
    zone.addEventListener('touchend', endJoy);
    zone.addEventListener('touchcancel', endJoy);
  }

  setupLookZone() {
    const lookZone = this.hudEl.querySelector('#look-zone');

    lookZone.addEventListener('touchstart', (e) => {
      if (this.paused) return;
      if (this.lookTouchId !== null) return;
      // Hanya terima touch yang target-nya lookZone atau child-nya (bukan tombol HUD)
      if (e.target !== lookZone) return;
      const t = e.changedTouches[0];
      this.lookTouchId = t.identifier;
      this.lastLook.x = t.clientX;
      this.lastLook.y = t.clientY;
      // TIDAK preventDefault di sini — biarkan click pada tombol lain lewat
    }, { passive: true });

    lookZone.addEventListener('touchmove', (e) => {
      if (this.paused || this.lookTouchId === null) return;
      for (const t of e.changedTouches) {
        if (t.identifier === this.lookTouchId) {
          const dx = t.clientX - this.lastLook.x;
          const dy = t.clientY - this.lastLook.y;
          this.lastLook.x = t.clientX;
          this.lastLook.y = t.clientY;
          this.controls.lookDelta(dx, dy);
          e.preventDefault();
          break;
        }
      }
    }, { passive: false });

    const endLook = (e) => {
      if (this.lookTouchId === null) return;
      for (const t of e.changedTouches) {
        if (t.identifier === this.lookTouchId) {
          this.lookTouchId = null;
          break;
        }
      }
    };
    lookZone.addEventListener('touchend', endLook);
    lookZone.addEventListener('touchcancel', endLook);
  }

  // Reset semua touch state — dipanggil saat pause/unpause
  resetTouchState() {
    this.joyTouchId = null;
    this.lookTouchId = null;
    this.joyValue.x = 0;
    this.joyValue.y = 0;
    const base = this.hudEl?.querySelector('#joystick-base');
    const knob = this.hudEl?.querySelector('#joystick-knob');
    if (base) base.classList.remove('active');
    if (knob) knob.style.transform = 'translate(-50%, -50%)';
  }

  setPaused(p) {
    this.paused = p;
    this.resetTouchState();
  }

  openInventory() {
    if (this.inventoryUI) return;
    this.setPaused(true);
    this.inventoryUI = new InventoryUI(this.container, this.inventory, (itemId) => {
      const item = this.inventory.use(itemId);
      if (item) this.showToast(`Menggunakan ${item.name}`);
      this.closeInventory();
    });
    this.inventoryUI.onClose = () => this.closeInventory();
    this.inventoryUI.show();
  }

  closeInventory() {
    if (this.inventoryUI) {
      this.inventoryUI.hide();
      this.inventoryUI = null;
    }
    this.setPaused(false);
  }

  showToast(text) {
    const container = this.hudEl?.querySelector('#toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = text;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  async toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
        if (screen.orientation && screen.orientation.lock) {
          try { await screen.orientation.lock('landscape'); } catch {}
        }
      } else {
        if (screen.orientation && screen.orientation.unlock) {
          try { screen.orientation.unlock(); } catch {}
        }
        await document.exitFullscreen();
      }
    } catch (err) { console.warn('Fullscreen failed:', err.message); }
  }

  updateFullscreenBtn() {
    const btn = this.buttonsEl?.querySelector('#btn-fullscreen');
    if (btn) btn.classList.toggle('fs-on', this.isFullscreen);
  }

  openPauseMenu() {
    if (this.pauseEl) return;
    this.setPaused(true);
    this.pauseEl = document.createElement('div');
    this.pauseEl.id = 'pause-menu';
    this.pauseEl.innerHTML = `
      <div class="pause-panel">
        <h2>PAUSED</h2>
        <button class="pause-btn primary" data-action="resume">RESUME</button>
        <button class="pause-btn" data-action="settings">SETTINGS</button>
        <button class="pause-btn danger" data-action="exit">EXIT TO HOME</button>
      </div>
    `;
    this.container.appendChild(this.pauseEl);
    this.pauseEl.querySelectorAll('.pause-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'resume') this.closePauseMenu();
        else if (action === 'settings') this.openSettings();
        else if (action === 'exit') this.exitToHome();
      });
    });
  }

  closePauseMenu() {
    if (this.pauseEl) { this.pauseEl.remove(); this.pauseEl = null; }
    this.setPaused(false);
  }

  openSettings() {
    const panel = this.pauseEl?.querySelector('.pause-panel');
    if (!panel) return;
    panel.innerHTML = `
      <h2>SETTINGS</h2>
      <label class="pause-label">
        Look sensitivity
        <input type="range" min="0.5" max="2.0" step="0.1" value="1.0" id="set-sens" />
      </label>
      <label class="pause-label">
        Move speed
        <input type="range" min="2" max="7" step="0.5" value="4" id="set-speed" />
      </label>
      <button class="pause-btn primary" data-action="back">BACK</button>
      <button class="pause-btn danger" data-action="exit">EXIT TO HOME</button>
    `;
    panel.querySelector('#set-sens').addEventListener('input', (e) => {
      this.controls.lookSensitivity = 0.0028 * parseFloat(e.target.value);
    });
    panel.querySelector('#set-speed').addEventListener('input', (e) => {
      this.controls.speed = parseFloat(e.target.value);
    });
    panel.querySelector('[data-action="back"]').addEventListener('click', () => {
      this.pauseEl.remove();
      this.pauseEl = null;
      this.openPauseMenu();
    });
    panel.querySelector('[data-action="exit"]').addEventListener('click', () => {
      this.exitToHome();
    });
  }

  async exitToHome() {
    if (this.pauseEl) this.pauseEl.remove();
    this.pauseEl = null;
    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch {}
    }
    if (screen.orientation && screen.orientation.unlock) {
      try { screen.orientation.unlock(); } catch {}
    }
    this.destroy();
    location.reload();
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    if (!this.running) return;
    requestAnimationFrame(() => this.animate());
    const dt = Math.min(this.clock.getDelta(), 0.1);

    if (!this.paused) {
      this.controls.update(dt);
      if (this.playerSync) this.playerSync.update(dt);
      if (this.world) this.world.updateAnimals(dt);
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    this.running = false;
    for (const u of this.unsubs) u();
    this.unsubs.length = 0;
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('fullscreenchange', this.onFsChange);
    if (this.inventoryUI) { this.inventoryUI.hide(); this.inventoryUI = null; }
    this.playerSync?.destroy();
    this.playerSync = null;
    this.controls?.disable();
    this.renderer?.dispose();
    if (this.renderer?.domElement?.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    if (this.hudEl?.parentNode) this.hudEl.parentNode.removeChild(this.hudEl);
    if (this.buttonsEl?.parentNode) this.buttonsEl.parentNode.removeChild(this.buttonsEl);
    if (this.pauseEl?.parentNode) this.pauseEl.parentNode.removeChild(this.pauseEl);
    this.container.innerHTML = '';
  }
}
