import * as THREE from 'three';

export class Perumahan {
  constructor(scene, collision) {
    this.scene = scene;
    this.collision = collision;
  }

  createHouse(x, z, color = 0xf0e0c0) {
    const group = new THREE.Group();
    const h = 4; // Tinggi dinding
    const w = 10; // Lebar
    const d = 10; // Panjang

    // 1. Dinding Rumah
    const wallMat = new THREE.MeshLambertMaterial({ color });
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    body.position.y = h / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // 2. Atap Limas (Warna merah bata)
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x8a3a1a });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.8, 3, 4), roofMat);
    roof.position.y = h + 1.5;
    roof.rotation.y = Math.PI / 4; // Biar sejajar sama kotak
    roof.castShadow = true;
    group.add(roof);

    // 3. Pintu Depan (Coklat)
    const doorMat = new THREE.MeshLambertMaterial({ color: 0x5a3e2b });
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.5, 0.2), doorMat);
    door.position.set(0, 1.25, d / 2); // Nempel di depan
    group.add(door);

    // 4. Jendela (Kaca biru)
    const windowMat = new THREE.MeshLambertMaterial({ color: 0x9dc8e8 });
    const win1 = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 0.2), windowMat);
    win1.position.set(-3, 2.5, d / 2);
    group.add(win1);
    
    const win2 = win1.clone();
    win2.position.set(3, 2.5, d / 2);
    group.add(win2);

    // Posisi akhir
    group.position.set(x, 0, z);
    this.scene.add(group);

    // Collision kotak (biar ga bisa nembus)
    this.collision.addBox(x - w/2, 0, z - d/2, x + w/2, h, z + d/2);
  }
}
