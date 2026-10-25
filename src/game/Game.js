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

    this.modal = null;
    this.inventoryUI = null;
    this.pauseEl = null;

    this.running = false;
    this.clock = new THREE.Clock();
    this.hudEl = null;
    this.buttonsEl = null;
    this.joyValue = { x: 0, y: 0 };
    this.isFullscreen = false;
    this.unsubs = [];

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

    this.renderer.render(this.scene, this.camera);
    if (onProgress) onProgress(1, 'Selesai');

    this.running = true;
    this.animate();
  }

  createHUD() {
    this.hudEl = document.createElement('div');
    this.hudEl.id = 'game-hud';
    this.hudEl.style.cssText = `position: fixed; inset: 0; pointer-events: none; z-index: 50;`;
    
    this.hudEl.innerHTML = `
      <div id="crosshair" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.75); box-shadow: 0 0 6px rgba(0,0,0,0.6);"></div>
      
      <!-- Joystick Base dipindah ke HTML -->
      <div id="joystick-base" style="position: absolute; width: 100px; height: 100px; border-radius: 50%; background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.3); opacity: 0; transition: opacity 0.1s; pointer-events: none; z-index: 60;">
        <div id="joystick-knob" style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.5); top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none;"></div>
      </div>
      
      <div id="toast-container" style="position: absolute; top: 72px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; gap: 8px; pointer-events: none; z-index: 80; width: 90%; max-width: 360px;"></div>
    `;
    this.container.appendChild(this.hudEl);

    this.buttonsEl = document.createElement('div');
    this.buttonsEl.id = 'hud-buttons';
    this.buttonsEl.style.cssText = `position: fixed; top: 12px; right: 12px; display: flex; gap: 8px; pointer-events: auto; z-index: 9999;`;
    
    const btnStyle = `width: 48px; height: 48px; border-radius: 12px; background: rgba(0,0,0,0.7); border: 1px solid rgba(255,255,255,0.3); color: #fff; font-size: 22px; display: flex; align-items: center; justify-content: center; cursor: pointer; touch-action: manipulation;`;

    this.buttonsEl.innerHTML = `
      <button id="btn-inventory" style="${btnStyle}">🎒</button>
      <button id="btn-fullscreen" style="${btnStyle}">⛶</button>
      <button id="btn-settings" style="${btnStyle}">⚙</button>
    `;
    this.container.appendChild(this.buttonsEl);

    this.setupTouchControls();

    this.buttonsEl.querySelector('#btn-inventory').addEventListener('click', (e) => { e.stopPropagation(); this.openInventory(); });
    this.buttonsEl.querySelector('#btn-fullscreen').addEventListener('click', (e) => { e.stopPropagation(); this.toggleFullscreen(); });
    this.buttonsEl.querySelector('#btn-settings').addEventListener('click', (e) => { e.stopPropagation(); this.openPauseMenu(); });
  }

  setupTouchControls() {
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

    document.addEventListener('touchstart', (e) => {
      if (this.modal !== null) return;

      for (const t of e.changedTouches) {
        if (t.clientX < window.innerWidth / 2 && this.joyTouchId === null) {
          this.joyTouchId = t.identifier;
          this.joyCenter.x = t.clientX;
          this.joyCenter.y = t.clientY;
          base.style.left = (t.clientX - this.joyRadius) + 'px';
          base.style.top = (t.clientY - this.joyRadius) + 'px';
          base.style.opacity = '1';
          updateKnob(0, 0);
        } 
        else if (t.clientX >= window.innerWidth / 2 && this.lookTouchId === null) {
          this.lookTouchId = t.identifier;
          this.lastLook.x = t.clientX;
          this.lastLook.y = t.clientY;
        }
      }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (this.modal !== null) return;

      for (const t of e.changedTouches) {
        if (t.identifier === this.joyTouchId) {
          updateKnob(t.clientX - this.joyCenter.x, t.clientY - this.joyCenter.y);
        } else if (t.identifier === this.lookTouchId) {
          const dx = t.clientX - this.lastLook.x;
          const dy = t.clientY - this.lastLook.y;
          this.lastLook.x = t.clientX;
          this.lastLook.y = t.clientY;
          this.controls.lookDelta(dx, dy);
        }
      }
    }, { passive: true });

    const endTouch = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === this.joyTouchId) {
          this.joyTouchId = null;
          this.joyValue.x = 0;
          this.joyValue.y = 0;
          base.style.opacity = '0';
          knob.style.transform = 'translate(-50%, -50%)';
        } else if (t.identifier === this.lookTouchId) {
          this.lookTouchId = null;
        }
      }
    };

    document.addEventListener('touchend', endTouch, { passive: true });
    document.addEventListener('touchcancel', endTouch, { passive: true });
  }

  openModal(kind) {
    if (this.modal === kind) return false;
    if (this.modal !== null) this.closeModal();
    this.modal = kind;
    return true;
  }

  closeModal() {
    if (this.modal === null) return false;
    const kind = this.modal;
    this.modal = null;

    if (kind === 'inventory' && this.inventoryUI) {
      this.inventoryUI.hide();
      this.inventoryUI = null;
    }
    if (kind === 'pause' && this.pauseEl) {
      this.pauseEl.remove();
      this.pauseEl = null;
    }
    
    this.joyTouchId = null;
    this.lookTouchId = null;
    this.joyValue.x = 0;
    this.joyValue.y = 0;
    const base = this.hudEl?.querySelector('#joystick-base');
    if (base) base.style.opacity = '0';
    return true;
  }

  openInventory() {
    if (!this.openModal('inventory')) return;
    this.inventoryUI = new InventoryUI(this.container, this.inventory, (itemId) => {
      const item = this.inventory.use(itemId);
      if (item) this.showToast(`Menggunakan ${item.name}`);
    }, () => this.closeModal());
    this.inventoryUI.show();
  }

  openPauseMenu() {
    if (!this.openModal('pause')) return;
    this.pauseEl = document.createElement('div');
    this.pauseEl.id = 'pause-menu';
    this.pauseEl.style.cssText = `position: fixed; inset: 0; background: rgba(5,5,15,0.78); display: flex; align-items: center; justify-content: center; z-index: 9999; pointer-events: auto; padding: 24px;`;
    this.pauseEl.innerHTML = `
      <div style="width: 100%; max-width: 320px; background: rgba(20,20,40,0.98); border: 1px solid #2a2a40; border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 12px;">
        <h2 style="font-size: 18px; font-weight: 700; letter-spacing: 3px; text-align: center; margin-bottom: 8px; color: #6ee7b7;">PAUSED</h2>
        <button class="pause-btn primary" data-action="resume" style="padding: 14px 20px; border-radius: 10px; border: 1px solid #3b82f6; background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; font-size: 15px; font-weight: 600; cursor: pointer;">RESUME</button>
        <button class="pause-btn" data-action="settings" style="padding: 14px 20px; border-radius: 10px; border: 1px solid #2a2a40; background: rgba(40,40,60,0.8); color: #e8e8f0; font-size: 15px; font-weight: 600; cursor: pointer;">SETTINGS</button>
        <button class="pause-btn danger" data-action="exit" style="padding: 14px 20px; border-radius: 10px; border: 1px solid #b03030; background: rgba(180,40,40,0.6); color: #e8e8f0; font-size: 15px; font-weight: 600; cursor: pointer;">EXIT TO HOME</button>
      </div>
    `;
    this.container.appendChild(this.pauseEl);
    
    this.pauseEl.querySelectorAll('.pause-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'resume') this.closeModal();
        else if (action === 'settings') this.openSettings();
        else if (action === 'exit') this.exitToHome();
      });
    });
  }

  openSettings() {
    if (!this.pauseEl) return;
    this.pauseEl.innerHTML = `
      <div style="width: 100%; max-width: 320px; background: rgba(20,20,40,0.98); border: 1px solid #2a2a40; border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 12px;">
        <h2 style="font-size: 18px; font-weight: 700; letter-spacing: 3px; text-align: center; margin-bottom: 8px; color: #6ee7b7;">SETTINGS</h2>
        <label style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #9aa0b0;">
          Look sensitivity
          <input type="range" min="0.5" max="2.0" step="0.1" value="1.0" id="set-sens" style="width: 100%; accent-color: #3b82f6;" />
        </label>
        <label style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #9aa0b0;">
          Move speed
          <input type="range" min="2" max="7" step="0.5" value="4" id="set-speed" style="width: 100%; accent-color: #3b82f6;" />
        </label>
        <button class="pause-btn primary" data-action="back" style="padding: 14px 20px; border-radius: 10px; border: 1px solid #3b82f6; background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 10px;">BACK</button>
        <button class="pause-btn danger" data-action="exit" style="padding: 14px 20px; border-radius: 10px; border: 1px solid #b03030; background: rgba(180,40,40,0.6); color: #e8e8f0; font-size: 15px; font-weight: 600; cursor: pointer;">EXIT TO HOME</button>
      </div>
    `;
    
    this.pauseEl.querySelector('#set-sens').addEventListener('input', (e) => {
      this.controls.lookSensitivity = 0.0028 * parseFloat(e.target.value);
    });
    this.pauseEl.querySelector('#set-speed').addEventListener('input', (e) => {
      this.controls.speed = parseFloat(e.target.value);
    });
    this.pauseEl.querySelector('[data-action="back"]').addEventListener('click', () => {
      this.closeModal();
      this.openPauseMenu();
    });
    this.pauseEl.querySelector('[data-action="exit"]').addEventListener('click', () => {
      this.exitToHome();
    });
  }

  showToast(text) {
    const container = this.hudEl?.querySelector('#toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.style.cssText = `padding: 10px 16px; border-radius: 10px; background: rgba(20,20,40,0.95); border: 1px solid #3b82f6; color: #e8e8f0; font-size: 12px; text-align: center;`;
    toast.textContent = text;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.4s'; setTimeout(() => toast.remove(), 400); }, 3000);
  }

  async toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
        // Coba kunci landscape dengan try-catch agar tidak crash
        if (screen.orientation && screen.orientation.lock) {
          screen.orientation.lock('landscape').catch(() => {});
        }
      } else {
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
        }
        await document.exitFullscreen();
      }
    } catch (err) { console.warn('Fullscreen failed:', err.message); }
  }

  async exitToHome() {
    this.closeModal();
    if (document.fullscreenElement) { try { await document.exitFullscreen(); } catch {} }
    if (screen.orientation && screen.orientation.unlock) { try { screen.orientation.unlock(); } catch {} }
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

    if (this.modal === null) {
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
    this.closeModal();
    this.playerSync?.destroy();
    this.controls?.disable();
    this.renderer?.dispose();
    if (this.renderer?.domElement?.parentNode) { this.renderer.domElement.parentNode.removeChild(this.renderer.domElement); }
    if (this.hudEl?.parentNode) this.hudEl.parentNode.removeChild(this.hudEl);
    if (this.buttonsEl?.parentNode) this.buttonsEl.parentNode.removeChild(this.buttonsEl);
    this.container.innerHTML = '';
  }
}
