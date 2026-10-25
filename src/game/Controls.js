export class Controls {
  constructor(camera, canvas) {
    this.camera = camera;
    this.canvas = canvas;

    this.yaw = 0;
    this.pitch = 0;
    this.speed = 4.0;
    this.joystick = { x: 0, y: 0 };
    this.keys = {};

    this.lookSensitivity = 0.0028;
    this.minPitch = -Math.PI / 2 + 0.01;
    this.maxPitch = Math.PI / 2 - 0.01;

    this._onKeyDown = (e) => { this.keys[e.code] = true; };
    this._onKeyUp = (e) => { this.keys[e.code] = false; };

    this._onCanvasClick = () => {
      if (this.canvas.requestPointerLock) this.canvas.requestPointerLock();
    };

    this._onPointerLockMove = (e) => {
      if (document.pointerLockElement === this.canvas) {
        this.yaw -= e.movementX * this.lookSensitivity;
        this.pitch -= e.movementY * this.lookSensitivity;
        this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));
        this.applyRotation();
      }
    };
  }

  enable() {
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    this.canvas.addEventListener('click', this._onCanvasClick);
    document.addEventListener('mousemove', this._onPointerLockMove);
  }

  disable() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this.canvas.removeEventListener('click', this._onCanvasClick);
    document.removeEventListener('mousemove', this._onPointerLockMove);
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
  }

  setJoystick(value) {
    this.joystick = value;
  }

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
    // Joystick: x = strafe (kanan positif), y = maju/mundur (atas negatif)
    // Kita mau: dorong joystick ke ATAS (y negatif) = MAJU.
    let strafe = 0;
    let forward = 0;

    if (this.joystick && (this.joystick.x !== 0 || this.joystick.y !== 0)) {
      strafe = this.joystick.x;
      forward = -this.joystick.y;   // <-- fix: ke atas joystick (y negatif) = maju (forward positif)
    } else {
      if (this.keys['KeyW']) forward += 1;
      if (this.keys['KeyS']) forward -= 1;
      if (this.keys['KeyD']) strafe += 1;
      if (this.keys['KeyA']) strafe -= 1;
    }

    // Normalisasi diagonal
    const len = Math.hypot(strafe, forward);
    if (len > 1) { strafe /= len; forward /= len; }

    // Arah gerak dalam world space berdasarkan yaw kamera.
    // Forward kamera (Three.js) = -Z lokal. Diterapkan rotasi yaw:
    //   worldForwardX = -sin(yaw)
    //   worldForwardZ = -cos(yaw)
    // Strafe kanan = (cos(yaw), -sin(yaw)) -- turunan dari cross.
    const sinY = Math.sin(this.yaw);
    const cosY = Math.cos(this.yaw);

    const worldX = -forward * sinY + strafe * cosY;
    const worldZ = -forward * cosY - strafe * sinY;

    const moveSpeed = this.speed * dt;
    this.camera.position.x += worldX * moveSpeed;
    this.camera.position.z += worldZ * moveSpeed;
    this.camera.position.y = 1.6;

    // Clamp world
    this.camera.position.x = Math.max(-37, Math.min(37, this.camera.position.x));
    this.camera.position.z = Math.max(-37, Math.min(37, this.camera.position.z));
  }
}
