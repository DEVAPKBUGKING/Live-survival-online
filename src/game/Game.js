import * as THREE from 'three';
import { World } from './World.js';
import { Controls } from './Controls.js';
import { Collision } from './Collision.js';
import { PlayerSync } from '../multiplayer/PlayerSync.js';
import { Inventory } from './Inventory.js';
import { InventoryUI } from '../ui/InventoryUI.js';
import { LocationUI } from '../ui/LocationUI.js';
import { UIManager } from '../ui/UIManager.js';
import { NPCManager } from './NPCManager.js';

// Import Data NPC
import { NPCGeco } from '../data/npc/NPCGeco.js';

export class Game {
  constructor(container) {
    this.container = container;
    this.container.style.position = 'absolute';
    this.container.style.inset = '0';
    this.container.style.zIndex = '0';

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.world = null;
    this.controls = null;
    this.collision = new Collision();
    this.playerSync = null;
    this.inventory = null;
    this.locationUI = null;
    this.uiManager = null;
    
    // Manager NPC
    this.npcManager = null;

    this.modal = null;
    this.inventoryUI = null;
    this.pauseEl = null;
    this.interactBtn = null;
    this.nearbyInteractable = null;

    this.running = false;
    this.clock = new THREE.Clock();
    this.hudEl = null;
    this.buttonsEl = null;
    this.joyValue = { x: 0, y: 0 };
    this.isFullscreen = false;
    this.isForcedLandscape = false;
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
    this.renderDistance = 100;
    this.scene.fog = new THREE.Fog(0x9dc8e8, this.renderDistance * 0.4, this.renderDistance);

    this.camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 1.6, 0);
    this.camera.rotation.order = 'YXZ';

    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap; 
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
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

    this.locationUI = new LocationUI(this.container);
    this.uiManager = new UIManager(this.container);

    // --- LOAD NPC DARI DATA ---
    this.npcManager = new NPCManager(this.scene, this.collision);
    
    const gecoInteract = this.npcManager.loadNPC(NPCGeco);
    this.world.city.interactables.push(gecoInteract);
    // --------------------------

    if (onProgress) onProgress(0.9, 'Menyiapkan UI');
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
          this.showToast(`${p.name} telah join`);
        }
      }));
    }

    this.onResize = () => this.handleResize();
    window.addEventListener('resize', this.onResize);
    window.addEventListener('orientationchange', this.onResize);

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
      <div id="toast-container" style="position: absolute; top: 72px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; gap: 8px; pointer-events: none; z-index: 80; width: 90%; max-width: 360px;"></div>
    `;
    this.container.appendChild(this.hudEl);

    this.interactBtn = document.createElement('button');
    this.interactBtn.id = 'btn-interact';
    this.interactBtn.style.cssText = `
      position: fixed; bottom: 25%; right: 20px; width: 60px; height: 60px;
      border-radius: 50%; background: rgba(59,130,246,0.8); color: #fff;
      border: 2px solid #fff; font-weight: bold; font-size: 16px;
      display: none; align-items: center; justify-content: center;
      z-index: 9999; cursor: pointer; pointer-events: auto;
      box-shadow: 0 4px 10px rgba(0,0,0,0.5);
    `;
    this.interactBtn.textContent = 'E';
    this.interactBtn.addEventListener('click', () => this.doInteract());
    document.body.appendChild(this.interactBtn);

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE') this.doInteract();
    });

    this.joyBaseEl = document.createElement('div');
    this.joyBaseEl.id = 'joystick-base';
    this.joyBaseEl.style.cssText = `position: fixed; width: 100px; height: 100px; border-radius: 50%; background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.6); visibility: hidden; pointer-events: none; z-index: 99999; transform: translate(-50%, -50%);`;
    this.joyBaseEl.innerHTML = `<div id="joystick-knob" style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.8); top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none;"></div>`;
    document.body.appendChild(this.joyBaseEl);

    this.buttonsEl = document.createElement('div');
    this.buttonsEl.id = 'hud-buttons';
    this.buttonsEl.style.cssText = `position: fixed; top: 12px; right: 12px; display: flex; gap: 8px; pointer-events: auto; z-index: 9999;`;
    const btnStyle = `width: 48px; height: 48px; border-radius: 12px; background: rgba(0,0,0,0.7); border: 1px solid rgba(255,255,255,0.3); color: #fff; font-size: 22px; display: flex; align-items: center; justify-content: center; cursor: pointer; touch-action: manipulation;`;

    this.buttonsEl.innerHTML = `
      <button id="btn-inventory" style="${btnStyle}">🎒</button>
      <button id="btn-license" style="${btnStyle}">🪪</button>
      <button id="btn-settings" style="${btnStyle}">⚙</button>
    `;
    document.body.appendChild(this.buttonsEl);

    this.setupTouchControls();

    this.buttonsEl.querySelector('#btn-inventory').addEventListener('click', (e) => { e.stopPropagation(); this.openInventory(); });
    this.buttonsEl.querySelector('#btn-license').addEventListener('click', (e) => { e.stopPropagation(); this.uiManager.showLicense(); });
    this.buttonsEl.querySelector('#btn-settings').addEventListener('click', (e) => { e.stopPropagation(); this.openPauseMenu(); });
  }

  setupTouchControls() {
    const base = this.joyBaseEl;
    const knob = this.joyBaseEl.querySelector('#joystick-knob');

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
        if (t.target.closest('button')) continue;
        if (t.clientX < window.innerWidth / 2 && this.joyTouchId === null) {
          this.joyTouchId = t.identifier;
          this.joyCenter.x = t.clientX;
          this.joyCenter.y = t.clientY;
          base.style.left = t.clientX + 'px';
          base.style.top = t.clientY + 'px';
          base.style.visibility = 'visible';
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
          base.style.visibility = 'hidden';
          knob.style.transform = 'translate(-50%, -50%)';
        } else if (t.identifier === this.lookTouchId) {
          this.lookTouchId = null;
        }
      }
    };
    document.addEventListener('touchend', endTouch, { passive: true });
    document.addEventListener('touchcancel', endTouch, { passive: true });
  }

  checkInteractables() {
    if (this.modal !== null || !this.world.city) return;
    let nearest = null;
    let minDist = Infinity;

    for (const obj of this.world.city.interactables) {
      const dist = this.camera.position.distanceTo(obj.position);
      if (dist < obj.radius && dist < minDist) {
        minDist = dist;
        nearest = obj;
      }
    }

    if (nearest) {
      if (this.nearbyInteractable !== nearest) {
        this.nearbyInteractable = nearest;
        this.interactBtn.style.display = 'flex';
      }
    } else {
      this.nearbyInteractable = null;
      this.interactBtn.style.display = 'none';
    }
  }

  doInteract() {
    if (!this.nearbyInteractable) return;
    
    if (this.nearbyInteractable.type === 'airport') this.openTravelMenu('Airport');
    else if (this.nearbyInteractable.type === 'subway') this.openTravelMenu('Subway');
    else if (this.nearbyInteractable.type === 'npc') {
      const npc = this.nearbyInteractable.npcRef;
      const dialog = npc.getNextDialog();
      
      this.openModal('dialog');
      this.uiManager.showDialog(npc.name, dialog.text, () => {
        // Cek apakah ini dialog terakhir
        if (npc.currentDialogIndex === 0) {
          // Panggil aksi spesifik dari file data NPC
          if (npc.data && npc.data.onDialogEnd) {
            npc.data.onDialogEnd(this.uiManager);
          }
        }
        this.closeModal();
        this.uiManager.hideDialog();
      });
    }
  }

  openTravelMenu(type) {
    if (!this.uiManager.hasLicense) {
      this.showToast("Kamu tidak punya Lisensi (KTP) untuk masuk!");
      return;
    }

    if (!this.openModal('travel')) return;
    this.pauseEl = document.createElement('div');
    this.pauseEl.id = 'pause-menu';
    this.pauseEl.style.cssText = `position: fixed; inset: 0; background: rgba(5,5,15,0.9); display: flex; align-items: center; justify-content: center; z-index: 9999; pointer-events: auto; padding: 24px;`;
    
    const destinations = type === 'Airport' 
      ? [{ city: 'Malang', country: 'Forge' }, { city: 'Jeddah', country: 'Saudi' }]
      : [{ city: 'Surabaya', country: 'Forge' }];

    let html = `<div style="width: 100%; max-width: 400px; background: rgba(20,20,40,0.98); border: 1px solid #2a2a40; border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 12px;">
      <h2 style="font-size: 18px; font-weight: 700; letter-spacing: 3px; text-align: center; margin-bottom: 8px; color: #6ee7b7;">${type.toUpperCase()} TICKET</h2>`;
    
    for (const d of destinations) {
      html += `<button class="dest-btn" data-city="${d.city}" data-country="${d.country}" style="padding: 14px; border-radius: 10px; border: 1px solid #2a2a40; background: rgba(40,40,60,0.8); color: #e8e8f0; font-size: 15px; font-weight: 600; cursor: pointer; text-align: left;">
        <div style="font-size: 16px; font-weight: 800; color: #fff;">${d.city}</div>
        <div style="font-size: 12px; color: #9aa0b0;">${d.country} - $50</div>
      </button>`;
    }

    html += `<button id="close-travel" style="padding: 14px; border-radius: 10px; border: 1px solid #b03030; background: rgba(180,40,40,0.6); color: #e8e8f0; font-weight: 600; margin-top: 10px; cursor: pointer;">BATAL</button></div>`;
    
    this.pauseEl.innerHTML = html;
    document.body.appendChild(this.pauseEl);

    this.pauseEl.querySelector('#close-travel').addEventListener('click', () => this.closeModal());
    
    this.pauseEl.querySelectorAll('.dest-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const city = btn.dataset.city;
        const country = btn.dataset.country;
        this.closeModal();
        
        if (this.uiManager.money < 50) {
          this.showToast("Uang tidak cukup!");
          return;
        }
        this.uiManager.addMoney(-50);

        this.locationUI.showTeleportScreen(country, city, () => {
          this.camera.position.set(0, 1.6, 0);
          this.showToast(`Selamat datang di ${city}, ${country}!`);
        });
      });
    });
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
    if (kind === 'inventory' && this.inventoryUI) { this.inventoryUI.hide(); this.inventoryUI = null; }
    if (kind === 'pause' || kind === 'travel') { 
      if(this.pauseEl) { this.pauseEl.remove(); this.pauseEl = null; }
    }
    this.joyTouchId = null; this.lookTouchId = null;
    this.joyValue.x = 0; this.joyValue.y = 0;
    if (this.joyBaseEl) this.joyBaseEl.style.visibility = 'hidden';
    return true;
  }

  openInventory() {
    if (!this.openModal('inventory')) return;
    this.inventoryUI = new InventoryUI(this.container, this.inventory, (itemId) => {
      this.inventory.use(itemId);
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
        <h2 style="font-size: 18px; font-weight: 700; letter-spacing: 3px; text-align: center; margin-bottom: 8px; color: #6ee7b7;">SETTINGS</h2>
        
        <label style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #9aa0b0;">
          Jarak Pandang (5 - 100)
          <input type="range" min="5" max="100" step="5" value="${this.renderDistance}" id="set-dist" style="width: 100%; accent-color: #3b82f6;" />
        </label>

        <button class="pause-btn primary" data-action="resume" style="padding: 14px 20px; border-radius: 10px; border: 1px solid #3b82f6; background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; font-size: 15px; font-weight: 600; cursor: pointer;">RESUME</button>
        <button class="pause-btn danger" data-action="exit" style="padding: 14px 20px; border-radius: 10px; border: 1px solid #b03030; background: rgba(180,40,40,0.6); color: #e8e8f0; font-size: 15px; font-weight: 600; cursor: pointer;">EXIT TO HOME</button>
      </div>
    `;
    document.body.appendChild(this.pauseEl);
    
    this.pauseEl.querySelector('#set-dist').addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      this.renderDistance = val;
      this.scene.fog = new THREE.Fog(0x9dc8e8, val * 0.4, val);
      this.camera.far = Math.max(250, val * 1.5);
      this.camera.updateProjectionMatrix();
    });

    this.pauseEl.querySelectorAll('.pause-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.action === 'resume') this.closeModal();
        else if (btn.dataset.action === 'exit') this.exitToHome();
      });
    });
  }

  showToast(text) {
    const container = this.hudEl?.querySelector('#toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.style.cssText = `padding: 10px 16px; border-radius: 10px; background: rgba(20,20,40,0.95); border: 1px solid #3b82f6; color: #e8e8f0; font-size: 12px; text-align: center; pointer-events: none;`;
    toast.textContent = text;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.4s'; setTimeout(() => toast.remove(), 400); }, 3000);
  }

  async toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
        setTimeout(() => {
          if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(() => this.forceLandscapeCSS());
          } else {
            this.forceLandscapeCSS();
          }
        }, 100);
      } else {
        if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
        this.removeForceLandscapeCSS();
        await document.exitFullscreen();
      }
    } catch (err) { console.warn('Fullscreen failed:', err.message); }
  }

  forceLandscapeCSS() {
    if (this.isForcedLandscape) return;
    this.isForcedLandscape = true;
    this.container.style.transform = 'rotate(90deg)';
    this.container.style.transformOrigin = 'bottom left';
    this.container.style.width = '100vh';
    this.container.style.height = '100vw';
    this.container.style.position = 'absolute';
    this.container.style.top = '-100vw';
    this.container.style.left = '0';
    setTimeout(() => this.handleResize(), 100);
  }

  removeForceLandscapeCSS() {
    if (!this.isForcedLandscape) return;
    this.isForcedLandscape = false;
    this.container.style.transform = '';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.position = 'absolute';
    this.container.style.top = '0';
    this.container.style.left = '0';
    setTimeout(() => this.handleResize(), 100);
  }

  async exitToHome() {
    this.closeModal();
    this.removeForceLandscapeCSS();
    if (document.fullscreenElement) { try { await document.exitFullscreen(); } catch {} }
    if (screen.orientation && screen.orientation.unlock) { try { screen.orientation.unlock(); } catch {} }
    this.destroy();
    location.reload();
  }

  handleResize() {
    let w = window.innerWidth;
    let h = window.innerHeight;
    if (this.isForcedLandscape) { w = window.innerHeight; h = window.innerWidth; }
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  animate() {
    if (!this.running) return;
    requestAnimationFrame(() => this.animate());
    const dt = Math.min(this.clock.getDelta(), 0.1);

    if (this.modal === null) {
      this.controls.update(dt);
      if (this.playerSync) this.playerSync.update(dt);
      if (this.world) this.world.updateAnimals(dt);
      this.checkInteractables();
    }
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    this.running = false;
    for (const u of this.unsubs) u();
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('orientationchange', this.onResize);
    this.closeModal();
    this.playerSync?.destroy();
    this.controls?.disable();
    this.renderer?.dispose();
    if (this.renderer?.domElement?.parentNode) this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    if (this.joyBaseEl?.parentNode) this.joyBaseEl.parentNode.removeChild(this.joyBaseEl);
    if (this.buttonsEl?.parentNode) this.buttonsEl.parentNode.removeChild(this.buttonsEl);
    if (this.interactBtn?.parentNode) this.interactBtn.parentNode.removeChild(this.interactBtn);
    this.container.innerHTML = '';
  }
}
