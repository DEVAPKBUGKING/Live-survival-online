import * as THREE from 'three';
export class Polisi {
  constructor(scene, collision) { this.scene = scene; this.collision = collision; }
  create(x, z) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(15, 8, 15), new THREE.MeshLambertMaterial({ color: 0x1e3a8a }));
    body.position.y = 4; body.castShadow = true; group.add(body);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(16, 1, 16), new THREE.MeshLambertMaterial({ color: 0x111111 }));
    roof.position.y = 8.5; group.add(roof);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(8, 2), new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
    sign.position.set(0, 5, 7.6); group.add(sign);
    group.position.set(x, 0, z); this.scene.add(group);
    this.collision.addBox(x - 7.5, 0, z - 7.5, x + 7.5, 8, z + 7.5);
  }
}
