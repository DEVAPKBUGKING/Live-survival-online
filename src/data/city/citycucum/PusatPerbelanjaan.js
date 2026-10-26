import * as THREE from 'three';
export class PusatPerbelanjaan {
  constructor(scene, collision) { this.scene = scene; this.collision = collision; }
  create(x, z) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(30, 10, 30), new THREE.MeshLambertMaterial({ color: 0xcccccc }));
    body.position.y = 5; body.castShadow = true; group.add(body);
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x9dc8e8, transparent: true, opacity: 0.6 });
    const glass = new THREE.Mesh(new THREE.BoxGeometry(25, 8, 30.2), glassMat);
    glass.position.y = 5; group.add(glass);
    group.position.set(x, 0, z); this.scene.add(group);
    this.collision.addBox(x - 15, 0, z - 15, x + 15, 10, z + 15);
  }
}
