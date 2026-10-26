import * as THREE from 'three';
export class Taman {
  constructor(scene, collision) { this.scene = scene; this.collision = collision; }
  create(x, z) {
    const group = new THREE.Group();
    // Air Mancur
    const pond = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 1, 16), new THREE.MeshLambertMaterial({ color: 0x60a5fa }));
    pond.position.y = 0.5; group.add(pond);
    const fountain = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1, 5, 8), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    fountain.position.y = 3; group.add(fountain);
    group.position.set(x, 0, z); this.scene.add(group);
    this.collision.addBox(x - 8, 0, z - 8, x + 8, 1, z + 8);
  }
}
