import * as THREE from 'three';
export class RumahSakit {
  constructor(scene, collision) { this.scene = scene; this.collision = collision; }
  create(x, z) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(25, 15, 20), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    body.position.y = 7.5; body.castShadow = true; group.add(body);
    // Palang Merah
    const crossMat = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    const c1 = new THREE.Mesh(new THREE.BoxGeometry(2, 6, 0.5), crossMat); c1.position.set(0, 10, 10.1); group.add(c1);
    const c2 = new THREE.Mesh(new THREE.BoxGeometry(6, 2, 0.5), crossMat); c2.position.set(0, 10, 10.1); group.add(c2);
    group.position.set(x, 0, z); this.scene.add(group);
    this.collision.addBox(x - 12.5, 0, z - 10, x + 12.5, 15, z + 10);
  }
}
