import * as THREE from 'three';
import { World } from './World.js';
import { Controls } from './Controls.js';
import { Collision } from './Collision.js';
import { Minimap } from '../ui/Minimap.js';
import { UIManager } from '../ui/UIManager.js';

export class Game {
  constructor(container, profile) {
    this.container = container;
    this.profile = profile;
    
    // State Mobil
    this.isDriving = false;
    this.drivenVehicle = null;
    this.carInputs = { gas: false, brake: false, left: false, right: false };
    
    // Bersihkan sisa HTML
    this.container.innerHTML = '';
    document.querySelectorAll('#game-hud, #car-controls, #hud-buttons, #joystick-base, #minimap-canvas').forEach(el => el.remove());

    this.container.style.position = 'absolute';
    this.container.style.inset = '0';
    this.container.style.zIndex = '0';

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(-90, 1.6, 135); // Spawn depan rumah
    this.camera.rotation.order = 'YXZ';

    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap; 
    this.container.appendChild(this.renderer.domElement);

    this.collision = new Collision();
    this.world = new World(this.scene, this.collision);
    this.controls = new Controls(this.camera, this.renderer.domElement, this.collision);
    
    this.minimap = new Minimap();
    this.uiManager = new UIManager(this.container, this.profile);

    this.clock = new THREE.Clock();
    this.running = false;
    this.isFullscreen = false;
    
    // State UI
    this.modal = null;
    this.interactBtn = null;
    this.nearbyInteractable = null;
    this.joyTouchId = null;
    this.lookTouchId = null;
    this.joyCenter = { x: 0, y: 0 };
    this.lastLook = { x: 0, y: 0 };
    this.joyRadius = 50;
    this.joyValue = { x: 0, y: 0 };
  }

  async start(onProgress) {
    await this.world.build(onProgress);
    this.controls.enable();
    this.controls.setJoystick(this.joyValue);
    
    this.createHUD();
    this.createCarControls();
    
    this.onResize = () => this.handleResize();
    window.addEventListener('resize', this.onResize);
    window.addEventListener('orientationchange', this.onResize);

    this.running = true;
    this.animate();
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  createHUD() {
    this.hudEl = document.createElement('div');
    this.hudEl.id = 'game-hud';
    this.hudEl.style.cssText = `position: fixed; inset: 0; pointer-events: none; z-index: 50;`;
    this.hudEl.innerHTML = `
      <div id="crosshair" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.75); box-shadow: 0 0 6px rgba(0,0,0,0.6);"></div>
      <div id="toast-container" style="position: absolute; top: 72px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; gap: 8px; pointer-events: none; z-index: 80; width: 90%; max-width: 360px;"></div>
    `;
    document.body.appendChild(this.hudEl);

    // Tombol Interaksi
    this.interactBtn = document.createElement('button');
    this.interactBtn.style.cssText = `position: fixed; bottom: 25%; right: 20px; width: 60px; height: 60px; border-radius: 50%; background: rgba(59,130,246,0.8); color: #fff; border: 2px solid #fff; font-weight: bold; font-size: 16px; display: none; align-items: center; justify-content: center; z-index: 9999; cursor: pointer; pointer-events: auto;`;
    this.interactBtn.textContent = 'E';
    this.interactBtn.addEventListener('click', () => this.doInteract());
    document.body.appendChild(this.interactBtn);

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE') this.doInteract();
    });

    // Joystick Virtual
    this.joyBaseEl = document.createElement('div');
    this.joyBaseEl.id = 'joystick-base';
    this.joyBaseEl.style.cssText = `position: fixed; width: 100px; height: 100px; border-radius: 50%; background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.6); visibility: hidden; pointer-events: none; z-index: 99999; transform: translate(-50%, -50%);`;
    this.joyBaseEl.innerHTML = `<div id="joystick-knob" style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.8); top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none;"></div>`;
    document.body.appendChild(this.joyBaseEl);

    // Tombol Kanan Atas
    this.buttonsEl = document.createElement('div');
    this.buttonsEl.id = 'hud-buttons';
    this.buttonsEl.style.cssText = `position: fixed; top: 12px; right: 12px; display: flex; gap: 8px; pointer-events: auto; z-index: 9999;`;
    const btnStyle = `width: 48px; height: 48px; border-radius: 12px; background: rgba(0,0,0,0.7); border: 1px solid rgba(255,255,255,0.3); color: #fff; font-size: 22px; display: flex; align-items: center; justify-content: center; cursor: pointer; touch-action: manipulation;`;

    this.buttonsEl.innerHTML = `
      <button id="btn-fullscreen" style="${btnStyle}">⛶</button>
      <button id="btn-settings" style="${btnStyle}">⚙</button>
    `;
    document.body.appendChild(this.buttonsEl);

    this.buttonsEl.querySelector('#btn-fullscreen').addEventListener('click', (e) => { e.stopPropagation(); this.toggleFullscreen(); });
    this.buttonsEl.querySelector('#btn-settings').addEventListener('click', (e) => { e.stopPropagation(); this.openPauseMenu(); });

    this.setupTouchControls();
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
      if (this.modal !== null || this.isDriving) return;
      for (const t of e.changedTouches) {
        if (t.target.closest('button') || t.target.closest('#car-controls')) continue;
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
      if (this.modal !== null || this.isDriving) return;
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

  createCarControls() {
    this.carUI = document.createElement('div');
    this.carUI.style.cssText = `position: fixed; inset: 0; pointer-events: none; z-index: 99999; display: none;`;
    const btnStyle = `position: absolute; bottom: 30px; width: 70px; height: 70px; background: rgba(0,0,0,0.6); border: 2px solid #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; pointer-events: auto; color: #fff; font-weight: bold; user-select: none;`;
    
    const bLeft = document.createElement('div'); bLeft.innerHTML = '⬅️'; bLeft.style.cssText = btnStyle + `left: 30px;`;
    const bRight = document.createElement('div'); bRight.innerHTML = '➡️'; bRight.style.cssText = btnStyle + `left: 120px;`;
    const bGas = document.createElement('div'); bGas.innerHTML = 'GAS'; bGas.style.cssText = btnStyle + `right: 30px; background: rgba(34,197,94,0.8);`;
    const bBrake = document.createElement('div'); bBrake.innerHTML = 'REM'; bBrake.style.cssText = btnStyle + `right: 120px; background: rgba(239,68,68,0.8);`;
    const bExit = document.createElement('div'); bExit.innerHTML = 'TURUN'; bExit.style.cssText = `position: absolute; top: 80px; left: 20px; padding: 10px 20px; background: rgba(255,255,255,0.2); border: 1px solid #fff; border-radius: 10px; pointer-events: auto; color: #fff; font-weight: bold;`;

    this.carUI.append(bLeft, bRight, bGas, bBrake, bExit);
    document.body.appendChild(this.carUI);

    const bind = (el, key) => {
      el.addEventListener('touchstart', (e) => { e.preventDefault(); this.carInputs[key] = true; });
      el.addEventListener('touchend', (e) => { e.preventDefault(); this.carInputs[key] = false; });
      el.addEventListener('mousedown', () => this.carInputs[key] = true);
      el.addEventListener('mouseup', () => this.carInputs[key] = false);
      el.addEventListener('mouseleave', () => this.carInputs[key] = false);
    };
    bind(bLeft, 'left'); bind(bRight, 'right'); bind(bGas, 'gas'); bind(bBrake, 'brake');
    bExit.addEventListener('click', () => this.exitVehicle());
  }

  doInteract() {
    if (this.isDriving || this.modal !== null) return;
    
    // Cek jarak ke mobil (-90, 130)
    const dist = this.camera.position.distanceTo(new THREE.Vector3(-90, 0, 130));
    if (dist < 6) {
      this.isDriving = true;
      this.drivenVehicle = this.world.city.interactables[0].vehicleRef;
      this.drivenVehicle.isDriven = true;
      this.controls.enabled = false;
      this.interactBtn.style.display = 'none';
      this.carUI.style.display = 'block';
      this.joyBaseEl.style.visibility = 'hidden';
      this.showToast("Mesin nyala!");
    }
  }

  exitVehicle() {
    if (!this.isDriving) return;
    this.isDriving = false;
    this.drivenVehicle.isDriven = false;
    this.controls.enabled = true;
    this.carUI.style.display = 'none';
    this.camera.position.set(this.drivenVehicle.mesh.position.x + 2, 1.6, this.drivenVehicle.mesh.position.z);
    this.showToast("Turun dari mobil.");
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  openPauseMenu() {
    if (this.modal === 'pause') return;
    this.modal = 'pause';
    
    this.pauseEl = document.createElement('div');
    this.pauseEl.style.cssText = `position: fixed; inset: 0; background: rgba(5,5,15,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999; pointer-events: auto; padding: 24px;`;
    this.pauseEl.innerHTML = `
      <div style="width: 100%; max-width: 320px; background: rgba(20,20,40,0.98); border: 1px solid #2a2a40; border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 12px;">
        <h2 style="font-size: 18px; font-weight: 700; letter-spacing: 3px; text-align: center; margin-bottom: 8px; color: #6ee7b7;">PAUSED</h2>
        <button id="btn-resume" style="padding: 14px; border-radius: 10px; border: 1px solid #3b82f6; background: #3b82f6; color: #fff; font-weight: bold; cursor: pointer;">RESUME</button>
        <button id="btn-exit" style="padding: 14px; border-radius: 10px; border: 1px solid #b03030; background: rgba(180,40,40,0.6); color: #fff; font-weight: bold; cursor: pointer;">KELUAR KE MENU</button>
      </div>
    `;
    document.body.appendChild(this.pauseEl);

    this.pauseEl.querySelector('#btn-resume').addEventListener('click', () => {
      this.pauseEl.remove(); this.modal = null;
    });
    this.pauseEl.querySelector('#btn-exit').addEventListener('click', () => {
      window.location.reload();
    });
  }

  showToast(text) {
    const container = this.hudEl?.querySelector('#toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.style.cssText = `padding: 10px; border-radius: 10px; background: rgba(20,20,40,0.95); border: 1px solid #3b82f6; color: #fff; font-size: 12px; text-align: center;`;
    toast.textContent = text;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 3000);
  }

  animate() {
    if (!this.running) return;
    requestAnimationFrame(() => this.animate());
    const dt = Math.min(this.clock.getDelta(), 0.1);

    if (this.modal === null) {
      if (this.isDriving) {
        this.drivenVehicle.update(dt, this.carInputs, this.camera);
      } else {
        this.controls.update(dt);
        // Cek jarak mobil buat munculin tombol E
        const dist = this.camera.position.distanceTo(new THREE.Vector3(-90, 0, 130));
        if (dist < 6) {
          this.interactBtn.style.display = 'flex';
        } else {
          this.interactBtn.style.display = 'none';
        }
      }
      
      // Update Minimap
      if (this.minimap) {
        this.minimap.update(this.camera.position, this.controls.yaw);
      }
    }
    this.renderer.render(this.scene, this.camera);
  }
}
