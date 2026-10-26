import * as THREE from 'three';
export class Pelabuhan {
  constructor(scene, collision) { this.scene = scene; this.collision = collision; }
  create(x, z) {
    const group = new THREE.Group();
    const deck = new THREE.Mesh(new THREE.BoxGeometry(30, 1, 30), new THREE.MeshLambertMaterial({ color: 0x6b7280 }));
    deck.position.y = 1; group.add(deck);
    // Derek
    const craneMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 20), craneMat); pole.position.set(-10, 11, -10); group.add(pole);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(20, 1, 1), craneMat); arm.position.set(0, 20, -10); group.add(arm);
    group.position.set(x, 0, z); this.scene.add(group);
    this.collision.addBox(x - 15, 0, z - 15, x + 15, 1, z + 15);
  }
}
