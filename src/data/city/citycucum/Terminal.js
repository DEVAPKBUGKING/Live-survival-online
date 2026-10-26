import * as THREE from 'three';
export class Terminal {
  constructor(scene, collision) { this.scene = scene; this.collision = collision; }
  create(x, z) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(30, 6, 20), new THREE.MeshLambertMaterial({ color: 0xd1d5db }));
    body.position.y = 3; body.castShadow = true; group.add(body);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(32, 0.5, 22), new THREE.MeshLambertMaterial({ color: 0x3b82f6 }));
    roof.position.y = 6.2; group.add(roof);
    group.position.set(x, 0, z); this.scene.add(group);
    this.collision.addBox(x - 15, 0, z - 10, x + 15, 6, z + 10);
  }
}
