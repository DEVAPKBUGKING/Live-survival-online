import * as THREE from 'three';

export class BalaiKota {
  constructor(scene, collision) {
    this.scene = scene;
    this.collision = collision;
  }

  create(x, z) {
    const group = new THREE.Group();
    
    // Gedung Utama Putih
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xf0f0f0 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(30, 15, 20), wallMat);
    body.position.y = 7.5;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Atap Limas Merah Bata
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x8a3a1a });
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(0, 20, 8, 4), roofMat);
    roof.position.y = 19;
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.2, 1, 0.8);
    roof.castShadow = true;
    group.add(roof);

    // Pilar-pilar Megah di Depan
    const pillarMat = new THREE.MeshLambertMaterial({ color: 0xdddddd });
    for(let i=-10; i<=10; i+=5) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 15, 8), pillarMat);
      pillar.position.set(i, 7.5, 11);
      pillar.castShadow = true;
      group.add(pillar);
    }

    // Bendera di Atas
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 5), new THREE.MeshLambertMaterial({color: 0x333333}));
    pole.position.set(0, 25, 0);
    group.add(pole);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.5), new THREE.MeshLambertMaterial({color: 0xff0000, side: THREE.DoubleSide}));
    flag.position.set(1.5, 26, 0);
    group.add(flag);

    group.position.set(x, 0, z);
    this.scene.add(group);
    
    // Collision
    this.collision.addBox(x - 15, 0, z - 10, x + 15, 15, z + 10);
  }
}
