import * as THREE from 'three';
import { World } from './World.js';
import { Controls } from './Controls.js';
import { Collision } from './Collision.js';

export class Game {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.world = null;
    this.controls = null;
    this.collision = new Collision();
    this.running = false;
    this.paused = false;
    this.clock = new THREE.Clock();
    this.hudEl = null;
    this.pauseEl = null;
    this.joyValue = { x: 0, y: 0 };
    this.isFullscreen = false;
  }

  // onProgress(percent 0..1, label)
  async start(onProgress) {
    // ---- Scene ----
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x9dc8e8);
    this.scene.fog = new THREE.Fog(0x9dc8e8, 40, 95);

    // ---- Camera ----
    this.camera = new THREE.PerspectiveCamera(
      72, window.innerWidth / window.innerHeight, 0.1, 200
    );
    this.camera.position.set(0, 1.6, 0);
    this.camera.rotation.order = 'YXZ';

    // ---- Renderer (RINGAN) ----
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap; // termurah
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    // Tone mapping matikan — Lambert + hemisphere sudah cukup cerah
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.container.appendChild(this.renderer.domElement);

    if (onProgress) onProgress(0.15, 'Menyiapkan renderer');
    await new Promise(r => setTimeout(r, 0));

    // ---- World ----
    this.world = new World(this.scene, this.collision);
    await this.world.build((p, label) => {
      if (onProgress) onProgress(0.15 + p * 0.7, label);
    });

    // ---- Controls ----
    this.controls = new Controls(this.camera, this.renderer.domElement, this.collision);
    this.controls.enable();
    this.controls.setJoystick(this.joyValue);

    if (onProgress) onProgress(0.9, 'Menyiapkan kontrol');
    await new Promise(r => setTimeout(r, 0));

    // ---- HUD ----
    this.createHUD();

    // ---- Resize ----
    this.onResize = () => this.handleResize();
    window.addEventListener('resize', this.onResize);

    this.onFsChange = () => {
      this.isFullscreen = !!document.fullscreenElement;
      this.updateFullscreenBtn();
    };
    document.addEventListener('fullscreenchange', this.onFsChange);

    // ---- Render frame pertama ----
    this.renderer.render(this.scene, this.camera);

    if (onProgress) onProgress(1, 'Selesai');

    // ---- Loop ----
    this.running = true;
    this.animate();
  }

  createHUD() {
    this.hudEl = document.createElement('div');
    this.hudEl.id = 'game-hud';
    this.hudEl.classList.add('active');
    this.hudEl.innerHTML = `
      <div id="crosshair"></div>
      <div id="joystick-zone"></div>
      <div id="joystick-base"><div id="joystick-knob"></div></div>
      <div id="look-zone"></div>
      <div id="hud-buttons">
        <button id="btn-fullscreen" title="Fullscreen">⛶</button>
        <button id="btn-settings" title="Settings">⚙</button>
      </div>
    `;
    this.container.appendChild(this.hudEl);

    const zone = this.hudEl.querySelector('#joystick-zone');
    const base = this.hudEl.querySelector('#joystick-base');
    const knob = this.hudEl.querySelector('#joystick-knob');

    let joyActive = false;
    let joyCenter = { x: 0, y: 0 };
    const joyRadius = 50;

    const updateKnob = (dx, dy) => {
      const dist = Math.hypot(dx, dy);
      const clamped = Math.min(dist, joyRadius);
      const angle = Math.atan2(dy, dx);
      const kx = Math.cos(angle) * clamped;
      const ky = Math.sin(angle) * clamped;
      knob.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;
      this.joyValue.x = kx / joyRadius;
      this.joyValue.y = ky / joyRadius;
    };

    zone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      joyActive = true;
      joyCenter.x = t.clientX;
      joyCenter.y = t.clientY;
      base.style.position = 'fixed';
      base.style.left = (t.clientX - 50) + 'px';
      base.style.top = (t.clientY - 50) + 'px';
      base.classList.add('active');
      updateKnob(0, 0);
    }, { passive: false });

    zone.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!joyActive) return;
      const t = e.changedTouches[0];
      updateKnob(t.clientX - joyCenter.x, t.clientY - joyCenter.y);
    }, { passive: false });

    const endJoy = (e) => {
      e.preventDefault();
      joyActive = false;
      base.classList.remove('active');
      knob.style.transform = 'translate(-50%, -50%)';
      this.joyValue.x = 0;
      this.joyValue.y = 0;
    };
    zone.addEventListener('touchend', endJoy);
    zone.addEventListener('touchcancel', endJoy);

    const lookZone = this.hudEl.querySelector('#look-zone');
    let lookTouchId = null;
    let lastLook = { x: 0, y: 0 };

    lookZone.addEventListener('touchstart', (e) => {
      const t = e.changedTouches[0];
      lookTouchId = t.identifier;
      lastLook.x = t.clientX;
      lastLook.y = t.clientY;
    }, { passive: true });

    lookZone.addEventListener('touchmove', (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === lookTouchId) {
          const dx = t.clientX - lastLook.x;
          const dy = t.clientY - lastLook.y;
          lastLook.x = t.clientX;
          lastLook.y = t.clientY;
          this.controls.lookDelta(dx, dy);
        }
      }
    }, { passive: true });

    const endLook = () => { lookTouchId = null; };
    lookZone.addEventListener('touchend', endLook);
    lookZone.addEventListener('touchcancel', endLook);

    this.hudEl.querySelector('#btn-fullscreen').addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleFullscreen();
    });

    this.hudEl.querySelector('#btn-settings').addEventListener('click', (e) => {
      e.stopPropagation();
      this.openPauseMenu();
    });
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
    } catch (err) {
      console.warn('Fullscreen failed:', err.message);
    }
  }

  updateFullscreenBtn() {
    const btn = this.hudEl?.querySelector('#btn-fullscreen');
    if (btn) btn.classList.toggle('fs-on', this.isFullscreen);
  }

  // ============================================================
  // Pause menu — sekarang punya EXIT yang kembali ke home
  // ============================================================
  openPauseMenu() {
    if (this.paused) return;
    this.paused = true;
    this.joyValue.x = 0;
    this.joyValue.y = 0;

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
    if (this.pauseEl) {
      this.pauseEl.remove();
      this.pauseEl = null;
    }
    this.paused = false;
  }

  // Settings: sensitivity, speed, DAN tombol EXIT yang kembali ke home
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
      const v = parseFloat(e.target.value);
      this.controls.lookSensitivity = 0.0028 * v;
    });
    panel.querySelector('#set-speed').addEventListener('input', (e) => {
      this.controls.speed = parseFloat(e.target.value);
    });
    panel.querySelector('[data-action="back"]').addEventListener('click', () => {
      this.closePauseMenu();
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
    }
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    this.running = false;
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('fullscreenchange', this.onFsChange);
    this.controls?.disable();
    this.renderer?.dispose();
    if (this.renderer?.domElement?.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    if (this.hudEl?.parentNode) this.hudEl.parentNode.removeChild(this.hudEl);
    if (this.pauseEl?.parentNode) this.pauseEl.parentNode.removeChild(this.pauseEl);
    this.container.innerHTML = '';
  }
}
