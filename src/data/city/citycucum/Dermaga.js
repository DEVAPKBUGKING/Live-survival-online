import * as THREE from 'three';
export class Dermaga {
  constructor(scene, collision) { this.scene = scene; this.collision = collision; }
  create(x, z) {
    const group = new THREE.Group();
    const deck = new THREE.Mesh(new THREE.BoxGeometry(10, 1, 30), new THREE.MeshLambertMaterial({ color: 0x8b5a2b }));
    deck.position.set(0, 1, 0); deck.castShadow = true; group.add(deck);
    group.position.set(x, 0, z); this.scene.add(group);
    this.collision.addBox(x - 5, 0, z - 15, x + 5, 1, z + 15);
  }
}
