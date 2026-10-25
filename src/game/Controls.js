export class Controls {
  constructor(camera, canvas, collision) {
    this.camera = camera;
    this.canvas = canvas;
    this.collision = collision;

    this.yaw = 0;
    this.pitch = 0;
    this.speed = 4.0;
    this.joystick = { x: 0, y: 0 };
    this.keys = {};

    this.lookSensitivity = 0.0028;
    this.minPitch = -Math.PI / 2 + 0.01;
    this.maxPitch = Math.PI / 2 - 0.01;

    this.bobPhase = 0;
    this.bobAmplitude = 0.045;
    this.bobFrequency = 8.5;
    this.currentBob = 0;

    this.playerRadius = 0.35;

    this.dragging = false;
    this.lastMouse = { x: 0, y: 0 };
    this.pointerLockFailed = false;

    this._onKeyDown = (e) => { this.keys[e.code] = true; };
    this._onKeyUp = (e) => { this.keys[e.code] = false; };

    this._onCanvasClick = () => {
      if (this.pointerLockFailed) return;
      if (this.canvas.requestPointerLock) {
        const p = this.canvas.requestPointerLock();
        if (p && p.catch) p.catch(() => { this.pointerLockFailed = true; });
      }
    };

    this._onMouseMove = (e) => {
      if (document.pointerLockElement === this.canvas) {
        this.yaw -= (e.movementX || 0) * this.lookSensitivity;
        this.pitch -= (e.movementY || 0) * this.lookSensitivity;
        this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));
        this.applyRotation();
      } else if (this.dragging) {
        const dx = e.clientX - this.lastMouse.x;
        const dy = e.clientY - this.lastMouse.y;
        this.lastMouse.x = e.clientX;
        this.lastMouse.y = e.clientY;
        this.yaw -= dx * this.lookSensitivity;
        this.pitch -= dy * this.lookSensitivity;
        this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));
        this.applyRotation();
      }
    };

    this._onMouseDown = (e) => {
      if (e.button === 0 && document.pointerLockElement !== this.canvas) {
        this.dragging = true;
        this.lastMouse.x = e.clientX;
        this.lastMouse.y = e.clientY;
      }
    };

    this._onMouseUp = () => { this.dragging = false; };

    this._onPointerLockError = () => {
      this.pointerLockFailed = true;
    };
  }

  enable() {
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    this.canvas.addEventListener('click', this._onCanvasClick);
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mousedown', this._onMouseDown);
    document.addEventListener('mouseup', this._onMouseUp);
    document.addEventListener('pointerlockerror', this._onPointerLockError);
  }

  disable() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this.canvas.removeEventListener('click', this._onCanvasClick);
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mousedown', this._onMouseDown);
    document.removeEventListener('mouseup', this._onMouseUp);
    document.removeEventListener('pointerlockerror', this._onPointerLockError);
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
  }

  setJoystick(value) { this.joystick = value; }

  lookDelta(dx, dy) {
    this.yaw -= dx * this.lookSensitivity;
    this.pitch -= dy * this.lookSensitivity;
    this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));
    this.applyRotation();
  }

  applyRotation() {
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  }

  update(dt) {
    let strafe = 0;
    let forward = 0;

    if (this.joystick && (this.joystick.x !== 0 || this.joystick.y !== 0)) {
      strafe = this.joystick.x;
      forward = -this.joystick.y;
    } else {
      if (this.keys['KeyW']) forward += 1;
      if (this.keys['KeyS']) forward -= 1;
      if (this.keys['KeyD']) strafe += 1;
      if (this.keys['KeyA']) strafe -= 1;
    }

    const len = Math.hypot(strafe, forward);
    if (len > 1) { strafe /= len; forward /= len; }

    const sinY = Math.sin(this.yaw);
    const cosY = Math.cos(this.yaw);
    const worldX = -forward * sinY + strafe * cosY;
    const worldZ = -forward * cosY - strafe * sinY;

    const moveSpeed = this.speed * dt;
    const dx = worldX * moveSpeed;
    const dz = worldZ * moveSpeed;

    const px = this.camera.position.x;
    const pz = this.camera.position.z;
    const r = this.playerRadius;

    let nx = px;
    let nz = pz;

    if (!this.collision.isBlocked(px + dx, pz, r)) nx = px + dx;
    if (!this.collision.isBlocked(nx, pz + dz, r)) nz = pz + dz;

    this.camera.position.x = nx;
    this.camera.position.z = nz;

    const actualSpeed = Math.hypot(nx - px, nz - pz) / Math.max(dt, 0.0001);

    if (actualSpeed > 0.3) {
      this.bobPhase += dt * this.bobFrequency;
      const target = Math.sin(this.bobPhase) * this.bobAmplitude;
      this.currentBob += (target - this.currentBob) * Math.min(1, dt * 12);
    } else {
      this.currentBob += (0 - this.currentBob) * Math.min(1, dt * 10);
      if (Math.abs(this.currentBob) < 0.001) this.currentBob = 0;
    }

    this.camera.position.y = 1.6 + this.currentBob;
    
    // DINDING GAIB SUDAH DIHAPUS DARI SINI
  }
}
