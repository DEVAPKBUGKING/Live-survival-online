import * as THREE from 'three';

export class World {
  constructor(scene, collision) {
    this.scene = scene;
    this.collision = collision;
    this.animals = [];
  }

  async build(onProgress) {
    const steps = 6;
    let done = 0;
    const tick = async (label) => {
      done++;
      if (onProgress) onProgress(done / steps, label);
      await new Promise(r => setTimeout(r, 0));
    };

    this.buildLighting();
    await tick('Menyiapkan cahaya');
    this.buildGround();
    await tick('Membangun jalan');
    this.buildHouse();
    await tick('Membangun rumah');
    this.buildTrees();
    await tick('Menanam pohon');
    this.buildNature();
    await tick('Menambah rumput & batu');
    this.buildAnimals();
    await tick('Menghidupkan dunia');
  }

  buildLighting() {
    const hemi = new THREE.HemisphereLight(0xaaccff, 0x4a7c3f, 1.2);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff2d5, 1.2);
    sun.position.set(30, 50, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(512, 512); 
    sun.shadow.camera.left = -45;
    sun.shadow.camera.right = 45;
    sun.shadow.camera.top = 45;
    sun.shadow.camera.bottom = -45;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 120;
    sun.shadow.bias = -0.001; 
    this.scene.add(sun);

    const roomLight = new THREE.PointLight(0xffeedd, 1.5, 20);
    roomLight.position.set(0, 2.5, 0);
    this.scene.add(roomLight);
  }

  buildGround() {
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x5a8f4a });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), groundMat); // Diperluas buat tes jarak pandang
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Jalan
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x3a3a3a });
    const road = new THREE.Mesh(new THREE.PlaneGeometry(6, 200), roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, -100);
    road.receiveShadow = true;
    this.scene.add(road);

    // Marka Jalan (Diskip jika masuk area rumah)
    const stripeMat = new THREE.MeshLambertMaterial({ color: 0xd4b040 });
    for (let i = 0; i < 30; i++) {
      const zPos = -100 + i * 6;
      if (zPos > -5 && zPos < 5) continue; // Jangan gambar di dalam rumah
      
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 2), stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(0, 0.02, zPos);
      this.scene.add(stripe);
    }
  }

  buildHouse() {
    const floorMat = new THREE.MeshLambertMaterial({ color: 0xa07f5a });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0.05, 0); // Lebih tinggi dari jalan
    floor.receiveShadow = true;
    this.scene.add(floor);

    const wallMat = new THREE.MeshLambertMaterial({ color: 0xf0e0c0 });
    const wallHeight = 2.8;
    const wallThick = 0.2;

    this.addWall(0, wallHeight / 2, -5, 10, wallHeight, wallThick, wallMat);
    this.addWall(-5, wallHeight / 2, 0, wallThick, wallHeight, 10, wallMat);
    this.addWall(5, wallHeight / 2, 0, wallThick, wallHeight, 10, wallMat);

    const segWidth = 4.4;
    this.addWall(-(0.6 + segWidth / 2), wallHeight / 2, 5, segWidth, wallHeight, wallThick, wallMat);
    this.addWall(0.6 + segWidth / 2, wallHeight / 2, 5, segWidth, wallHeight, wallThick, wallMat);
    const header = this.addBox(0, wallHeight - 0.3, 5, 1.2, 0.6, wallThick, wallMat);
    header.castShadow = true;

    const roofMat = new THREE.MeshLambertMaterial({ color: 0x8a3a1a });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.3, 10.8), roofMat);
    roof.position.set(0, wallHeight + 0.15, 0);
    roof.castShadow = true;
    this.scene.add(roof);
  }

  buildTrees() {
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5a3e2b });
    const leafMats = [
      new THREE.MeshLambertMaterial({ color: 0x2d7a2d }),
      new THREE.MeshLambertMaterial({ color: 0x3a8f3a }),
      new THREE.MeshLambertMaterial({ color: 0x246b24 })
    ];

    const treePositions = [
      [-12, -8], [14, -4], [-16, 6], [18, 10], [-8, 14],
      [-20, -15], [22, -12], [-14, 18], [26, 2], [10, -20]
    ];

    for (const [x, z] of treePositions) {
      const scale = 0.8 + Math.random() * 0.6;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * scale, 0.28 * scale, 2.2 * scale, 8), trunkMat);
      trunk.position.set(x, 1.1 * scale, z);
      trunk.castShadow = true;
      this.scene.add(trunk);
      this.collision.addBox(x - 0.3, 0, z - 0.3, x + 0.3, 2.2 * scale, z + 0.3);

      const leafMat = leafMats[Math.floor(Math.random() * leafMats.length)];
      for (let i = 0; i < 3; i++) {
        const r = (1.5 - i * 0.35) * scale;
        const h = (1.6 - i * 0.2) * scale;
        const cone = new THREE.Mesh(new THREE.ConeGeometry(r, h, 8), leafMat);
        cone.position.set(x, (2.6 + i * 0.9) * scale, z);
        cone.rotation.y = Math.random() * Math.PI;
        cone.castShadow = true;
        this.scene.add(cone);
      }
    }
  }

  // --- FIX RUMPUT 3D (Model Cross-plane biar keliatan hidup) ---
  buildNature() {
    const grassMat = new THREE.MeshLambertMaterial({ color: 0x4caf50, side: THREE.DoubleSide });
    
    // Geometri rumput custom: 2 plane menyilang
    const grassGeo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -0.1, 0, 0,   0.1, 0, 0,   0, 0.5, 0, // Plane 1
      0, 0, -0.1,   0, 0, 0.1,   0, 0.5, 0  // Plane 2
    ]);
    grassGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    grassGeo.computeVertexNormals();

    for (let i = 0; i < 150; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 8 + Math.random() * 60;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      
      if (Math.abs(x) < 6 && Math.abs(z) < 6) continue; // Skip dalam rumah

      const blade = new THREE.Mesh(grassGeo, grassMat);
      blade.position.set(x, 0, z);
      blade.rotation.y = Math.random() * Math.PI;
      blade.scale.setScalar(0.5 + Math.random() * 0.8);
      this.scene.add(blade);
    }

    const rockMat = new THREE.MeshLambertMaterial({ color: 0x7a7a7a });
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 15 + Math.random() * 50;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      if (Math.abs(x) < 6 && Math.abs(z) < 6) continue;
      
      const s = 0.2 + Math.random() * 0.2; // Batu lebih kecil
      const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), rockMat);
      rock.position.set(x, s * 0.5, z);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      this.scene.add(rock);
      this.collision.addBox(x - s, 0, z - s, x + s, s * 2, z + s);
    }
  }

  buildAnimals() {
    // ... (Sama kayak sebelumnya)
  }

  updateAnimals(dt) {
    // ... (Sama kayak sebelumnya)
  }

  addWall(x, y, z, w, h, d, material) {
    const mesh = this.addBox(x, y, z, w, h, d, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.collision.addBox(x - w / 2, 0, z - d / 2, x + w / 2, h, z + d / 2);
    return mesh;
  }

  addBox(x, y, z, w, h, d, material) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(x, y, z);
    this.scene.add(mesh);
    return mesh;
  }
}
