import * as THREE from 'three';

export class Environment {
  constructor(scene, collision) {
    this.scene = scene;
    this.collision = collision;
  }

  build() {
    this.buildSkyAndClouds();
    this.buildTreesAndGrass();
  }

  buildSkyAndClouds() {
    // Langit biru pudar
    this.scene.background = new THREE.Color(0xa1c4d6);
    this.scene.fog = new THREE.Fog(0xa1c4d6, 100, 300);

    // Awan (Pakai Sphere pipih biar hemat GPU)
    const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
    for (let i = 0; i < 10; i++) {
      const group = new THREE.Group();
      for (let j = 0; j < 4; j++) {
        const geo = new THREE.SphereGeometry(Math.random() * 10 + 5, 7, 7);
        const mesh = new THREE.Mesh(geo, cloudMat);
        mesh.position.set(Math.random() * 10, 0, Math.random() * 10);
        mesh.scale.y = 0.4; // Pipih
        group.add(mesh);
      }
      group.position.set((Math.random() - 0.5) * 400, 60 + Math.random() * 20, (Math.random() - 0.5) * 400);
      this.scene.add(group);
    }
  }

  buildTreesAndGrass() {
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a3b32 });
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x2e4a2e });
    
    // Pohon-pohon di pinggir jalan (Maksimal 40 pohon biar ga ngelag)
    for (let i = -140; i <= 140; i += 20) {
      for (let j = -140; j <= 140; j += 20) {
        // Skip jalan tengah
        if (Math.abs(i) < 20 || Math.abs(j) < 20) continue;
        
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 4, 6), trunkMat);
        trunk.position.set(i, 2, j);
        trunk.castShadow = true;
        this.scene.add(trunk);
        this.collision.addBox(i - 0.5, 0, j - 0.5, i + 0.5, 4, j + 0.5);

        // Daun rindang
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(3, 5, 7), leafMat);
        leaf.position.set(i, 5.5, j);
        leaf.castShadow = true;
        this.scene.add(leaf);
      }
    }
  }
}
