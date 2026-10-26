import * as THREE from 'three';
export class Hotel {
  constructor(scene, collision) { this.scene = scene; this.collision = collision; }
  create(x, z) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(20, 25, 15), new THREE.MeshLambertMaterial({ color: 0x9d174d }));
    body.position.y = 12.5; body.castShadow = true; group.add(body);
    const winMat = new THREE.MeshLambertMaterial({ color: 0xfcd34d });
    for(let i=2; i<25; i+=4) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(18, 1, 15.2), winMat); w.position.y = i; group.add(w);
    }
    group.position.set(x, 0, z); this.scene.add(group);
    this.collision.addBox(x - 10, 0, z - 7.5, x + 10, 25, z + 7.5);
  }
}
