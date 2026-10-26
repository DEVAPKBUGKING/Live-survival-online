import * as THREE from 'three';

export class Supermarket {
  constructor(scene, collision) {
    this.scene = scene;
    this.collision = collision;
  }

  create(x, z) {
    const group = new THREE.Group();
    
    // Gedung Utama Biru
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x3b82f6 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(25, 8, 30), wallMat);
    body.position.y = 4;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Atap Datar
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(26, 1, 31), roofMat);
    roof.position.y = 8.5;
    group.add(roof);

    // Kaca Depan Transparan
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x9dc8e8, transparent: true, opacity: 0.6 });
    const glass = new THREE.Mesh(new THREE.BoxGeometry(15, 4, 1), glassMat);
    glass.position.set(0, 3, 15.1);
    group.add(glass);

    // Papan Nama (Tulisan di atas kaca)
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.font = 'bold 30px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('SUPERMARKET', 128, 40);
    const tex = new THREE.CanvasTexture(canvas);
    const sign = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
    sign.scale.set(15, 3.75, 1);
    sign.position.set(0, 6, 15.5);
    group.add(sign);

    group.position.set(x, 0, z);
    this.scene.add(group);

    // Collision
    this.collision.addBox(x - 12.5, 0, z - 15, x + 12.5, 8, z + 15);
  }
}
