import * as THREE from 'three';

export class CityMap {
  constructor(scene, collision) {
    this.scene = scene;
    this.collision = collision;
  }

  // Fungsi buat gambar daratan, lautan, jalan, dan tiang
  build(cityData) {
    this.buildIslandAndWater(cityData.size);
    this.buildRoads();
    this.buildMarkers(cityData.locations);
  }

  buildIslandAndWater(size) {
    // 1. LAUTAN (Biru)
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 2000),
      new THREE.MeshLambertMaterial({ color: 0x1e90ff })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.5;
    this.scene.add(water);

    // 2. DARATAN (Hijau)
    const land = new THREE.Mesh(
      new THREE.BoxGeometry(size, 1, size),
      new THREE.MeshLambertMaterial({ color: 0x4a7c3f })
    );
    land.position.y = -0.5;
    land.receiveShadow = true;
    this.scene.add(land);
  }

  buildRoads() {
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const markMat = new THREE.MeshLambertMaterial({ color: 0xd4b040 });

    // Jalan Utama Melingkar (Kotak)
    const rTop = new THREE.Mesh(new THREE.PlaneGeometry(280, 16), roadMat);
    rTop.rotation.x = -Math.PI / 2; rTop.position.set(0, 0.02, -130); this.scene.add(rTop);

    const rBot = new THREE.Mesh(new THREE.PlaneGeometry(280, 16), roadMat);
    rBot.rotation.x = -Math.PI / 2; rBot.position.set(0, 0.02, 130); this.scene.add(rBot);

    const rLeft = new THREE.Mesh(new THREE.PlaneGeometry(16, 280), roadMat);
    rLeft.rotation.x = -Math.PI / 2; rLeft.position.set(-130, 0.02, 0); this.scene.add(rLeft);

    const rRight = new THREE.Mesh(new THREE.PlaneGeometry(16, 280), roadMat);
    rRight.rotation.x = -Math.PI / 2; rRight.position.set(130, 0.02, 0); this.scene.add(rRight);

    // Jalan Tengah Nyilang
    const rCenterH = new THREE.Mesh(new THREE.PlaneGeometry(260, 12), roadMat);
    rCenterH.rotation.x = -Math.PI / 2; rCenterH.position.set(0, 0.03, 0); this.scene.add(rCenterH);

    const rCenterV = new THREE.Mesh(new THREE.PlaneGeometry(12, 260), roadMat);
    rCenterV.rotation.x = -Math.PI / 2; rCenterV.position.set(0, 0.03, 0); this.scene.add(rCenterV);

    // Bundaran
    const round = new THREE.Mesh(new THREE.CircleGeometry(25, 32), roadMat);
    round.rotation.x = -Math.PI / 2; round.position.set(0, 0.03, 0); this.scene.add(round);

    // Marka Tengah (Garis Kuning)
    for (let i = -120; i <= 120; i += 20) {
      if (Math.abs(i) < 25) continue; 
      const markH = new THREE.Mesh(new THREE.PlaneGeometry(10, 1), markMat);
      markH.rotation.x = -Math.PI / 2; markH.position.set(i, 0.04, 0); this.scene.add(markH);

      const markV = new THREE.Mesh(new THREE.PlaneGeometry(1, 10), markMat);
      markV.rotation.x = -Math.PI / 2; markV.position.set(0, 0.04, i); this.scene.add(markV);
    }
  }

  buildMarkers(locations) {
    locations.forEach(loc => {
      // Tiang
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 5, 8),
        new THREE.MeshLambertMaterial({ color: 0xffaa00 })
      );
      pole.position.set(loc.x, 2.5, loc.z);
      pole.castShadow = true;
      this.scene.add(pole);

      // Papan Teks
      const canvas = document.createElement('canvas');
      canvas.width = 512; canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, 0, 512, 128);
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 32px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(`${loc.icon} ${loc.name}`, 256, 50);
      ctx.fillStyle = '#ef4444'; ctx.font = 'bold 24px sans-serif';
      ctx.fillText('Masih dalam pembangunan', 256, 90);

      const tex = new THREE.CanvasTexture(canvas);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false }));
      sprite.scale.set(15, 3.75, 1);
      sprite.position.set(loc.x, 7, loc.z);
      this.scene.add(sprite);

      // Collision
      this.collision.addBox(loc.x - 1, 0, loc.z - 1, loc.x + 1, 5, loc.z + 1);
    });
  }
}
