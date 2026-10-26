import * as THREE from 'three';

export class Vehicle {
  constructor(scene, x, z) {
    this.scene = scene;
    this.mesh = new THREE.Group();
    this.isDriven = false;
    this.speed = 0;
    this.maxSpeed = 35;
    this.acceleration = 20;
    this.friction = 8;

    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2, 0.8, 4), bodyMat);
    body.position.y = 0.8;
    body.castShadow = true;
    this.mesh.add(body);

    const roofMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 2), roofMat);
    roof.position.set(0, 1.5, -0.2);
    roof.castShadow = true;
    this.mesh.add(roof);

    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 8);
    wheelGeo.rotateZ(Math.PI / 2);
    for (const [wx, wy, wz] of [[-1, 0.4, 1.2], [1, 0.4, 1.2], [-1, 0.4, -1.2], [1, 0.4, -1.2]]) {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(wx, wy, wz);
      this.mesh.add(wheel);
    }

    this.mesh.position.set(x, 0, z);
    this.scene.add(this.mesh);
  }

  // Ganti parameter 'controls' jadi 'inputs' (dari UI tombol)
  update(dt, inputs, camera) {
    if (!this.isDriven) return;

    if (inputs.gas) this.speed += this.acceleration * dt;
    else if (inputs.brake) this.speed -= this.acceleration * dt;
    else {
      if (this.speed > 0) this.speed = Math.max(0, this.speed - this.friction * dt);
      if (this.speed < 0) this.speed = Math.min(0, this.speed + this.friction * dt);
    }

    this.speed = Math.max(-this.maxSpeed / 2, Math.min(this.maxSpeed, this.speed));

    if (this.speed !== 0) {
      const turnSpeed = 2 * dt;
      if (inputs.left) this.mesh.rotation.y += turnSpeed * (this.speed > 0 ? 1 : -1);
      if (inputs.right) this.mesh.rotation.y -= turnSpeed * (this.speed > 0 ? 1 : -1);
    }

    const forward = new THREE.Vector3(0, 0, -1).applyEuler(this.mesh.rotation);
    this.mesh.position.x += forward.x * this.speed * dt;
    this.mesh.position.z += forward.z * this.speed * dt;

    const camOffset = new THREE.Vector3(0, 5, 10).applyEuler(this.mesh.rotation);
    camera.position.lerp(this.mesh.position.clone().add(camOffset), 5 * dt);
    camera.lookAt(this.mesh.position.x, this.mesh.position.y + 1, this.mesh.position.z);
  }
}
