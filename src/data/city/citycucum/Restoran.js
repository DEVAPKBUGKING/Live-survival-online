import * as THREE from 'three';
export class Restoran {
  constructor(scene, collision) { this.scene = scene; this.collision = collision; }
  create(x, z) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(12, 5, 12), new THREE.MeshLambertMaterial({ color: 0xf59e0b }));
    body.position.y = 2.5; body.castShadow = true; group.add(body);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(9, 4, 4), new THREE.MeshLambertMaterial({ color: 0x78350f }));
    roof.position.y = 7; roof.rotation.y = Math.PI/4; group.add(roof);
    group.position.set(x, 0, z); this.scene.add(group);
    this.collision.addBox(x - 6, 0, z - 6, x + 6, 5, z + 6);
  }
}
