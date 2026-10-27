import * as THREE from 'three';
import { World } from './World.js';
import { Controls } from './Controls.js';
import { Collision } from './Collision.js';

export class Game {
  constructor(container, profile) {
    this.container = container;
    this.profile = profile;
    this.isGodMode = false;
    this.isDriving = false;
    this.drivenVehicle = null;
    this.carInputs = { gas: false, brake: false, left: false, right: false };
    
    this.container.innerHTML = '';
    this.container.style.position = 'absolute'; this.container.style.inset = '0';

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(-90, 1.6, 140); // Spawn di depan rumah
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
    this.clock = new THREE.Clock();
    this.running = false;
    
    this.modal = null; // State buat UI
  }

  async start(onProgress) {
    await this.world.build(onProgress);
    this.controls.enable();
    this.createHUD();
    this.createCarControls();
    
    this.onResize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', this.onResize);

    this.running = true;
    this.animate();
  }

  createHUD() {
    // UI Sederhana buat test jalan
    this.hudEl = document.createElement('div');
    this.hudEl.id = 'game-hud';
    this.hudEl.style.cssText = `position: fixed; inset: 0; pointer-events: none; z-index: 50;`;
    document.body.appendChild(this.hudEl);
    
    this.interactBtn = document.createElement('button');
    this.interactBtn.style.cssText = `position: fixed; bottom: 25%; right: 20px; width: 60px; height: 60px; border-radius: 50%; background: rgba(59,130,246,0.8); color: #fff; border: 2px solid #fff; display: none; pointer-events: auto; z-index: 9999;`;
    this.interactBtn.textContent = 'E';
    this.interactBtn.addEventListener('click', () => this.doInteract());
    document.body.appendChild(this.interactBtn);
    
    window.addEventListener('keydown', (e) => { if (e.code === 'KeyE') this.doInteract(); });
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
    if (this.isDriving) return;
    const dist = this.camera.position.distanceTo(new THREE.Vector3(-90, 0, 130));
    if (dist < 5) {
      this.isDriving = true;
      this.drivenVehicle = this.world.city.interactables[0].vehicleRef;
      this.drivenVehicle.isDriven = true;
      this.controls.enabled = false;
      this.interactBtn.style.display = 'none';
      this.carUI.style.display = 'block';
    }
  }

  exitVehicle() {
    if (!this.isDriving) return;
    this.isDriving = false;
    this.drivenVehicle.isDriven = false;
    this.controls.enabled = true;
    this.carUI.style.display = 'none';
    this.camera.position.set(this.drivenVehicle.mesh.position.x + 2, 1.6, this.drivenVehicle.mesh.position.z);
  }

  animate() {
    if (!this.running) return;
    requestAnimationFrame(() => this.animate());
    const dt = Math.min(this.clock.getDelta(), 0.1);

    if (this.isDriving) {
      this.drivenVehicle.update(dt, this.carInputs, this.camera);
    } else {
      this.controls.update(dt);
      // Cek jarak mobil buat munculin tombol E
      const dist = this.camera.position.distanceTo(new THREE.Vector3(-90, 0, 130));
      this.interactBtn.style.display = (dist < 5) ? 'flex' : 'none';
      if (this.interactBtn.style.display === 'flex') {
        this.interactBtn.style.alignItems = 'center';
        this.interactBtn.style.justifyContent = 'center';
      }
    }
    this.renderer.render(this.scene, this.camera);
  }
}
