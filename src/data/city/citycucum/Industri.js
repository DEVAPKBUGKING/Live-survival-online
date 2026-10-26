import * as THREE from 'three';
export class Industri {
  constructor(scene, collision) { this.scene = scene; this.collision = collision; }
  create(x, z) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(40, 10, 20), new THREE.MeshLambertMaterial({ color: 0x4b5563 }));
    body.position.y = 5; body.castShadow = true; group.add(body);
    // Cerobong Asap
    const stackMat = new THREE.MeshLambertMaterial({ color: 0x9ca3af });
    for(let i=-10; i<=10; i+=10) {
      const s = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 15), stackMat);
      s.position.set(i, 15, -5); group.add(s);
    }
    group.position.set(x, 0, z); this.scene.add(group);
    this.collision.addBox(x - 20, 0, z - 10, x + 20, 10, z + 10);
  }
}
