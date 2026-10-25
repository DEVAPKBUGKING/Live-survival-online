export class Controls {
  constructor(camera, canvas) {
    this.camera = camera;
    this.canvas = canvas;

    this.yaw = 0;
    this.pitch = 0;
    this.speed = 3.5;
    this.joystick = null;
    this.keys = {};

    this.lookSensitivity = 0.0025;

    this._onKeyDown = (e) => { this.keys[e.code] = true; };
    this._onKeyUp = (e) => { this.keys[e.code] = false; };

    this._onCanvasClick = () => {
      if (this.canvas.requestPointerLock) this.canvas.requestPointerLock();
    };

    this._onPointerLockMove = (e) => {
      if (document.pointerLockElement === this.canvas) {
        this.yaw -= e.movementX * this.lookSensitivity;
        this.pitch -= e.movementY * this.lookSensitivity;
        const lim = Math.PI / 2 - 0.01;
        this.pitch = Math.max(-lim, Math.min(lim, this.pitch));
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
    const lim = Math.PI / 2 - 0.01;
    this.pitch = Math.max(-lim, Math.min(lim, this.pitch));
    this.applyRotation();
  }

  applyRotation() {
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  }

  update(dt) {
    let moveX = 0;
    let moveZ = 0;

    if (this.joystick) {
      moveX = this.joystick.x;
      moveZ = -this.joystick.y;
    } else {
      if (this.keys['KeyW']) moveZ -= 1;
      if (this.keys['KeyS']) moveZ += 1;
      if (this.keys['KeyA']) moveX -= 1;
      if (this.keys['KeyD']) moveX += 1;
    }

    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (len > 1) { moveX /= len; moveZ /= len; }

    const cos = Math.cos(this.yaw);
    const sin = Math.sin(this.yaw);
    const worldX = moveX * cos - moveZ * sin;
    const worldZ = moveX * sin + moveZ * cos;

    const moveSpeed = this.speed * dt;
    this.camera.position.x += worldX * moveSpeed;
    this.camera.position.z += worldZ * moveSpeed;
    this.camera.position.y = 1.6;

    this.camera.position.x = Math.max(-37, Math.min(37, this.camera.position.x));
    this.camera.position.z = Math.max(-37, Math.min(37, this.camera.position.z));
  }
}
