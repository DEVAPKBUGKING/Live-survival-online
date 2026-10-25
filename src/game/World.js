import * as THREE from 'three';
import { CityBuilder } from './CityBuilder.js';

export class World {
  constructor(scene, collision, cityData) {
    this.scene = scene;
    this.collision = collision;
    this.cityData = cityData; 
    this.city = new CityBuilder(scene, collision);
  }

  async build(onProgress) {
    const steps = 4;
    let done = 0;
    const tick = async (label) => {
      done++;
      if (onProgress) onProgress(done / steps, label);
      await new Promise(r => setTimeout(r, 0));
    };

    this.buildLighting();
    await tick('Menyiapkan cahaya');
    this.buildGroundAndRoads();
    await tick('Membangun jalan raya');
    this.buildMainHouse();
    await tick('Membangun Main House');
    this.buildCityStructures();
    await tick('Membangun gedung kota');
  }

  buildLighting() {
    const hemi = new THREE.HemisphereLight(0xaaccff, 0x4a7c3f, 1.0);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff2d5, 1.2);
    sun.position.set(50, 80, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024); 
    sun.shadow.camera.left = -150;
    sun.shadow.camera.right = 150;
    sun.shadow.camera.top = 150;
    sun.shadow.camera.bottom = -150;
    sun.shadow.camera.far = 300;
    sun.shadow.bias = -0.001; 
    this.scene.add(sun);
  }

  buildGroundAndRoads() {
    // Tanah dasar (warna aspal gelap biar ga terlalu hijau)
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x3a3a3a }); 
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Bikin Grid Jalan Raya (Kota)
    // Horizontal
    for (let z = -120; z <= 60; z += 40) {
      this.city.createRoad(0, z, 16, 200, false);
    }
    // Vertikal
    for (let x = -80; x <= 80; x += 40) {
      this.city.createRoad(x, -30, 16, 200, true);
    }
  }

  buildMainHouse() {
    const floorMat = new THREE.MeshLambertMaterial({ color: 0xa07f5a });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0.05, 0);
    this.scene.add(floor);

    const wallMat = new THREE.MeshLambertMaterial({ color: 0xf0e0c0 });
    const h = 2.8, t = 0.2;

    this.addWall(0, h / 2, -5, 10, h, t, wallMat);
    this.addWall(-5, h / 2, 0, t, h, 10, wallMat);
    this.addWall(5, h / 2, 0, t, h, 10, wallMat);
    this.addWall(-2.8, h / 2, 5, 4.4, h, t, wallMat);
    this.addWall(2.8, h / 2, 5, 4.4, h, t, wallMat);
    this.addBox(0, h - 0.3, 5, 1.2, 0.6, t, wallMat);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.3, 10.8), new THREE.MeshLambertMaterial({ color: 0x8a3a1a }));
    roof.position.set(0, h + 0.15, 0);
    roof.castShadow = true;
    this.scene.add(roof);
  }

  buildCityStructures() {
    const data = this.cityData;

    // 1. Bandara & Stasiun
    this.city.createAirport(data.airport.x, data.airport.z);
    this.city.createSubway(data.subway.x, data.subway.z);

    // 2. Perumahan (Dibikin agak jauh dari jalan raya)
    for (const house of data.residential) {
      this.city.createHouse(house.x, house.z, house.width, house.depth, house.color);
    }

    // 3. Gedung Tinggi
    for (const building of data.downtown) {
      this.city.createSkyscraper(building.x, building.z, building.width, building.depth, building.height, building.color);
    }

    // 4. Rumput (Cuma sedikit, ditaruh di sela-sela gedung / pinggir kota)
    const grassMat = new THREE.MeshLambertMaterial({ color: 0x4caf50, side: THREE.DoubleSide });
    const grassGeo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -0.1, 0, 0,   0.1, 0, 0,   0, 0.5, 0,
      0, 0, -0.1,   0, 0, 0.1,   0, 0.5, 0
    ]);
    grassGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    grassGeo.computeVertexNormals();

    for (let i = 0; i < 50; i++) {
      const x = (Math.random() - 0.5) * 150;
      const z = (Math.random() - 0.5) * 150;
      // Hanya taruh rumput jika koordinatnya bukan jalan raya (kelipatan 40)
      if (Math.abs(x % 40) < 10 || Math.abs(z % 40) < 10) continue;

      const blade = new THREE.Mesh(grassGeo, grassMat);
      blade.position.set(x, 0, z);
      blade.rotation.y = Math.random() * Math.PI;
      blade.scale.setScalar(0.5 + Math.random() * 0.8);
      this.scene.add(blade);
    }

    // Pohon di pinggir jalan raya
    for (let z = -100; z <= 60; z += 20) {
      if (z === 0) continue; // Skip depan rumah
      this.addTree(-12, z);
      this.addTree(12, z);
    }
  }

  addTree(x, z) {
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5a3e2b });
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x2d7a2d });
    
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 3, 8), trunkMat);
    trunk.position.set(x, 1.5, z);
    trunk.castShadow = true;
    this.scene.add(trunk);
    this.collision.addBox(x - 0.4, 0, z - 0.4, x + 0.4, 3, z + 0.4);

    for (let i = 0; i < 3; i++) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(2 - i*0.5, 2, 8), leafMat);
      cone.position.set(x, 3.5 + i*1.2, z);
      cone.castShadow = true;
      this.scene.add(cone);
    }
  }

  updateAnimals(dt) { /* Kosong */ }

  addWall(x, y, z, w, h, d, material) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.collision.addBox(x - w / 2, 0, z - d / 2, x + w / 2, h, z + d / 2);
    return mesh;
  }

  addBox(x, y, z, w, h, d, material) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    this.scene.add(mesh);
    return mesh;
  }
}
