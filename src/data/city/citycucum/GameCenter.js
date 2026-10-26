import * as THREE from 'three';
export class GameCenter {
  constructor(scene, collision) { this.scene = scene; this.collision = collision; }
  create(x, z) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(15, 10, 15), new THREE.MeshLambertMaterial({ color: 0x7c3aed }));
    body.position.y = 5; body.castShadow = true; group.add(body);
    const roof = new THREE.Mesh(new THREE.SphereGeometry(8, 16, 8, 0, Math.PI*2, 0, Math.PI/2), new THREE.MeshLambertMaterial({ color: 0x4c1d95 }));
    roof.position.y = 10; group.add(roof);
    group.position.set(x, 0, z); this.scene.add(group);
    this.collision.addBox(x - 7.5, 0, z - 7.5, x + 7.5, 10, z + 7.5);
  }
}
