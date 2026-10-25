import * as THREE from 'three';
import { World } from './World.js';
import { Controls } from './Controls.js';

export class Game {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.world = null;
    this.controls = null;
    this.running = false;
    this.clock = new THREE.Clock();
    this.hudEl = null;
    this.joyValue = { x: 0, y: 0 };
  }

  start() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 30, 80);

    this.camera = new THREE.PerspectiveCamera(
      70, window.innerWidth / window.innerHeight, 0.1, 200
    );
    this.camera.position.set(0, 1.6, 0);
    this.camera.rotation.order = 'YXZ';

    this.renderer = new THREE.WebGLRenderer({ antialias: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = false;
    this.container.appendChild(this.renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(20, 40, 10);
    this.scene.add(sun);

    this.world = new World(this.scene);
    this.world.build();

    this.controls = new Controls(this.camera, this.renderer.domElement);
    this.controls.enable();
    this.controls.setJoystick(this.joyValue);

    this.createHUD();

    this.onResize = () => this.handleResize();
    window.addEventListener('resize', this.onResize);

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
      <button id="back-btn">✕</button>
    `;
    this.container.appendChild(this.hudEl);

    const zone = this.hudEl.querySelector('#joystick-zone');
    const base = this.hudEl.querySelector('#joystick-base');
    const knob = this.hudEl.querySelector('#joystick-knob');

    let joyActive = false;
    let joyCenter = { x: 0, y: 0 };
    const joyRadius = 50;

    const updateKnob = (dx, dy) => {
      const dist = Math.sqrt(dx * dx + dy * dy);
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

    this.hudEl.querySelector('#back-btn').addEventListener('click', () => {
      this.destroy();
      location.reload();
    });
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
    this.controls.update(dt);
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    this.running = false;
    window.removeEventListener('resize', this.onResize);
    this.controls?.disable();
    this.renderer?.dispose();
    if (this.renderer?.domElement?.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    if (this.hudEl?.parentNode) this.hudEl.parentNode.removeChild(this.hudEl);
    this.container.innerHTML = '';
  }
}
