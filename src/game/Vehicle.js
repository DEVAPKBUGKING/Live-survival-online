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
    this.collisionBox = null;

    // Model Mobil Realistis (Low Poly, Low Saturation)
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x8a1c1c }); // Merah pudar
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 4.5), bodyMat);
    body.position.y = 0.7;
    body.castShadow = true;
    this.mesh.add(body);

    const cabinMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 2.2), cabinMat);
    cabin.position.set(0, 1.3, -0.2);
    cabin.castShadow = true;
    this.mesh.add(cabin);

    const glassMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const glass = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.5, 2.1), glassMat);
    glass.position.set(0, 1.35, -0.2);
    this.mesh.add(glass);

    // Roda
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x050505 });
    const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.3, 12);
    wheelGeo.rotateZ(Math.PI / 2);
    for (const [wx, wz] of [[-1.1, 1.4], [1.1, 1.4], [-1.1, -1.4], [1.1, -1.4]]) {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(wx, 0.45, wz);
      wheel.castShadow = true;
      this.mesh.add(wheel);
    }

    this.mesh.position.set(x, 0, z);
    this.scene.add(this.mesh);
  }

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

    const camOffset = new THREE.Vector3(0, 4, 9).applyEuler(this.mesh.rotation);
    camera.position.lerp(this.mesh.position.clone().add(camOffset), 5 * dt);
    camera.lookAt(this.mesh.position.x, this.mesh.position.y + 1, this.mesh.position.z);
  }
}
