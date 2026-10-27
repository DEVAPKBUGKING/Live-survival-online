import * as THREE from 'three';

export class Perumahan {
  constructor(scene, collision) {
    this.scene = scene;
    this.collision = collision;
  }

  // Palet Warna Low-Saturation (Kalem)
  getColors() {
    return {
      wall1: 0xd1ccc5, // Abu tulang
      wall2: 0xb0a89e, // Abu kecokelatan
      wall3: 0x9ba4b5, // Abu kebiruan pudar
      wall4: 0x8b7d6b, // Cokelat pudar
      roof1: 0x3d4045, // Atap hitam doff
      roof2: 0x5c5c5c, // Atap abu gelap
      glass: 0x7a8b99 // Kaca pudar
    };
  }

  createHouse(x, z, style = 1, customColor = null) {
    const group = new THREE.Group();
    const c = this.getColors();
    const wallColor = customColor || c.wall1;

    // 1. Model Rumah 2 Lantai (Gaya 1)
    if (style === 1) {
      const body = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 8), new THREE.MeshLambertMaterial({ color: wallColor }));
      body.position.y = 3; body.castShadow = true; group.add(body);
      
      const roof = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.3, 8.5), new THREE.MeshLambertMaterial({ color: c.roof1 }));
      roof.position.y = 6.15; group.add(roof);
      
      const balcony = new THREE.Mesh(new THREE.BoxGeometry(4, 0.5, 1), new THREE.MeshLambertMaterial({ color: c.roof2 }));
      balcony.position.set(-2, 3.5, 4); group.add(balcony);

      const door = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.5, 0.1), new THREE.MeshLambertMaterial({ color: c.glass }));
      door.position.set(1, 1.25, 4.05); group.add(door);
      
      const garage = new THREE.Mesh(new THREE.BoxGeometry(3, 2.5, 0.1), new THREE.MeshLambertMaterial({ color: c.roof2 }));
      garage.position.set(3, 1.25, 4.05); group.add(garage);
    }
    // 2. Model Rumah Atap Segitiga Bersusun (Gaya 2)
    else if (style === 2) {
      const body1 = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 8), new THREE.MeshLambertMaterial({ color: wallColor }));
      body1.position.set(1, 2, 0); body1.castShadow = true; group.add(body1);
      
      const body2 = new THREE.Mesh(new THREE.BoxGeometry(6, 6, 6), new THREE.MeshLambertMaterial({ color: wallColor }));
      body2.position.set(-1, 3, 0); body2.castShadow = true; group.add(body2);

      // Atap
      const roof1 = new THREE.Mesh(new THREE.ConeGeometry(6, 3, 4), new THREE.MeshLambertMaterial({ color: c.roof1 }));
      roof1.position.set(-1, 7.5, 0); roof1.rotation.y = Math.PI / 4; group.add(roof1);
    }
    // 3. Model Rumah Atap Limas Lebar (Gaya 3)
    else if (style === 3) {
      const body = new THREE.Mesh(new THREE.BoxGeometry(10, 4, 7), new THREE.MeshLambertMaterial({ color: wallColor }));
      body.position.y = 2; body.castShadow = true; group.add(body);
      
      const roof = new THREE.Mesh(new THREE.ConeGeometry(7.5, 3, 4), new THREE.MeshLambertMaterial({ color: c.roof1 }));
      roof.position.y = 5.5; roof.rotation.y = Math.PI / 4; group.add(roof);
    }
    // 4. Model Toko/Ruko Lengkung (Gaya 4)
    else if (style === 4) {
      const body = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 8), new THREE.MeshLambertMaterial({ color: wallColor }));
      body.position.y = 3; body.castShadow = true; group.add(body);

      const archRoof = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 12.2, 16, 1, false, 0, Math.PI), new THREE.MeshLambertMaterial({ color: c.roof1 }));
      archRoof.rotation.z = Math.PI / 2;
      archRoof.rotation.y = Math.PI / 2;
      archRoof.position.y = 6; group.add(archRoof);

      const glass = new THREE.Mesh(new THREE.BoxGeometry(10, 3, 0.2), new THREE.MeshLambertMaterial({ color: c.glass }));
      glass.position.set(0, 1.5, 4.1); group.add(glass);
    }
    // 5. Model Ruko Miring (Gaya 5)
    else if (style === 5) {
      const body = new THREE.Mesh(new THREE.BoxGeometry(8, 9, 8), new THREE.MeshLambertMaterial({ color: wallColor }));
      body.position.y = 4.5; body.castShadow = true; group.add(body);

      // Atap miring
      const roof = new THREE.Mesh(new THREE.BoxGeometry(9, 0.3, 9), new THREE.MeshLambertMaterial({ color: c.roof1 }));
      roof.position.set(0, 9, 0); roof.rotation.z = 0.2; group.add(roof);

      const glass = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 0.2), new THREE.MeshLambertMaterial({ color: c.glass }));
      glass.position.set(0, 2, 4.1); group.add(glass);
    }
    // 6. Model Rumah Modern Miring (Gaya 6)
    else if (style === 6) {
      const body = new THREE.Mesh(new THREE.BoxGeometry(11, 5, 7), new THREE.MeshLambertMaterial({ color: wallColor }));
      body.position.y = 2.5; body.castShadow = true; group.add(body);
      
      const roof = new THREE.Mesh(new THREE.BoxGeometry(12, 0.3, 8), new THREE.MeshLambertMaterial({ color: c.roof1 }));
      roof.position.set(0, 6, 0); roof.rotation.z = 0.15; group.add(roof);
    }
    // 7. Model Ruko Tinggi Bersusun (Gaya 7)
    else if (style === 7) {
      const body1 = new THREE.Mesh(new THREE.BoxGeometry(7, 5, 7), new THREE.MeshLambertMaterial({ color: wallColor }));
      body1.position.set(1, 2.5, 0); body1.castShadow = true; group.add(body1);
      
      const body2 = new THREE.Mesh(new THREE.BoxGeometry(6, 6, 6), new THREE.MeshLambertMaterial({ color: wallColor }));
      body2.position.set(-1, 7, 0); body2.castShadow = true; group.add(body2);

      const roof = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.3, 6.5), new THREE.MeshLambertMaterial({ color: c.roof1 }));
      roof.position.set(-1, 10, 0); group.add(roof);
    }
    // 8. Model Gedung Putih Tinggi (Gaya 8)
    else if (style === 8) {
      const body = new THREE.Mesh(new THREE.BoxGeometry(10, 15, 10), new THREE.MeshLambertMaterial({ color: c.wall1 }));
      body.position.y = 7.5; body.castShadow = true; group.add(body);

      // Kaca memanjang
      for (let i = 2; i < 15; i += 3) {
        const w = new THREE.Mesh(new THREE.BoxGeometry(10.2, 1, 10.2), new THREE.MeshLambertMaterial({ color: c.glass }));
        w.position.y = i; group.add(w);
      }
    }
    // 9. Model Cucu Mart (Gaya 9)
    else if (style === 9) {
      const body = new THREE.Mesh(new THREE.BoxGeometry(14, 5, 9), new THREE.MeshLambertMaterial({ color: wallColor }));
      body.position.y = 2.5; body.castShadow = true; group.add(body);

      const roof = new THREE.Mesh(new THREE.BoxGeometry(14.5, 0.5, 9.5), new THREE.MeshLambertMaterial({ color: c.wall1 }));
      roof.position.y = 5.25; group.add(roof);

      // Papan Nama (Pakai teks di canvas)
      const canvas = document.createElement('canvas');
      canvas.width = 512; canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#1e40af'; ctx.fillRect(0, 0, 512, 128); // Biru
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 60px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('CUCU MART', 256, 85);
      const tex = new THREE.CanvasTexture(canvas);
      const sign = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
      sign.scale.set(12, 3, 1);
      sign.position.set(0, 4.5, 4.6); group.add(sign);

      const glass = new THREE.Mesh(new THREE.BoxGeometry(12, 2, 0.2), new THREE.MeshLambertMaterial({ color: c.glass }));
      glass.position.set(0, 1.2, 4.6); group.add(glass);
    }

    // Posisi akhir
    group.position.set(x, 0, z);
    this.scene.add(group);

    // Collision kotak (semua disamain ukurannya biar aman)
    this.collision.addBox(x - 5, 0, z - 5, x + 5, 10, z + 5);
  }
}
