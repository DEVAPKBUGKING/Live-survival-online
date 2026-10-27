import * as THREE from 'three';

export class Supermarket {
  constructor(scene, collision) {
    this.scene = scene;
    this.collision = collision;
  }

  create(x, z) {
    const group = new THREE.Group();
    
    // Palet Warna Low-Saturation (Realistis & Kalem)
    const wallColor = 0xdcdcdc; // Putih tulang
    const trimColor = 0x2d3748; // Abu gelap metalik
    const glassColor = 0x4a5568; // Kaca gelap pudar
    const signColor = 0x2b6cb0; // Biru pudar

    const wallMat = new THREE.MeshLambertMaterial({ color: wallColor });
    const trimMat = new THREE.MeshLambertMaterial({ color: trimColor });
    const glassMat = new THREE.MeshLambertMaterial({ color: glassColor });

    // 1. Badan Gedung Utama
    const body = new THREE.Mesh(new THREE.BoxGeometry(20, 8, 15), wallMat);
    body.position.y = 4; 
    body.castShadow = true; 
    body.receiveShadow = true;
    group.add(body);

    // 2. Trim Atap (Listplang tebal atas)
    const roofTrim = new THREE.Mesh(new THREE.BoxGeometry(21, 1, 16), trimMat);
    roofTrim.position.y = 8.5;
    group.add(roofTrim);

    // 3. Kanopi Depan (Melindungi Kaca)
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(20, 0.2, 3), trimMat);
    canopy.position.set(0, 6.5, 9);
    group.add(canopy);

    // 4. Kaca Depan Besar (Dibagi 3 Panel)
    for (let i = -1; i <= 1; i++) {
      const glassPanel = new THREE.Mesh(new THREE.BoxGeometry(5.5, 5, 0.2), glassMat);
      glassPanel.position.set(i * 6, 3, 7.6);
      group.add(glassPanel);
      
      // Bingkai Kaca
      const frame = new THREE.Mesh(new THREE.BoxGeometry(6, 5.5, 0.3), trimMat);
      frame.position.set(i * 6, 3, 7.5);
      group.add(frame);
    }

    // 5. Pintu Geser Otomatis (Tengah)
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(4, 5, 0.4), trimMat);
    doorFrame.position.set(0, 2.5, 7.6);
    group.add(doorFrame);
    
    const doorGlass = new THREE.Mesh(new THREE.BoxGeometry(3.6, 4.6, 0.2), glassMat);
    doorGlass.position.set(0, 2.5, 7.7);
    group.add(doorGlass);

    // 6. Papan Nama (Neon Sign)
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Background Biru
    ctx.fillStyle = '#2b6cb0'; 
    ctx.fillRect(0, 0, 1024, 256);
    
    // Teks Putih
    ctx.fillStyle = '#ffffff'; 
    ctx.font = 'bold 120px sans-serif'; 
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CUCU MART', 512, 128);
    
    const tex = new THREE.CanvasTexture(canvas);
    const signMat = new THREE.MeshBasicMaterial({ map: tex }); // Basic biar agak nyala
    
    // Bingkai Papan Nama
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(16, 3, 0.5), trimMat);
    signBoard.position.set(0, 8.5, 7.7);
    group.add(signBoard);
    
    const signFace = new THREE.Mesh(new THREE.PlaneGeometry(15.5, 2.5), signMat);
    signFace.position.set(0, 8.5, 7.95);
    group.add(signFace);

    // 7. AC Unit di Atap (Detail kecil)
    const acMat = new THREE.MeshLambertMaterial({ color: 0xa0aec0 });
    const ac = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 2), acMat);
    ac.position.set(5, 9.5, -3);
    group.add(ac);

    // 8. Pot Tanaman Depan
    const potMat = new THREE.MeshLambertMaterial({ color: 0x4a5568 });
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x2f855a });
    for (let i = -1; i <= 1; i+=2) {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.4, 1, 8), potMat);
      pot.position.set(i * 8, 0.5, 8);
      group.add(pot);
      
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.5, 6), leafMat);
      leaf.position.set(i * 8, 1.5, 8);
      group.add(leaf);
    }

    group.position.set(x, 0, z);
    this.scene.add(group);

    // Collision (Ukuran 20x15)
    this.collision.addBox(x - 10, 0, z - 7.5, x + 10, 8, z + 7.5);
  }
}
