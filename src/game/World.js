import * as THREE from 'three';
import { CityBuilder } from './CityBuilder.js';

export class World {
  constructor(scene, collision, cityData) {
    this.scene = scene;
    this.collision = collision;
    this.cityData = cityData; 
    this.city = new CityBuilder(scene, collision);
    this.animals = [];
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
    this.buildGround();
    await tick('Membangun jalan');
    this.buildMainHouse();
    await tick('Membangun Main House');
    this.buildCityStructures();
    await tick('Membangun pusat kota');
  }

  buildLighting() {
    const hemi = new THREE.HemisphereLight(0xaaccff, 0x4a7c3f, 1.2);
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

  buildGround() {
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x5a8f4a });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Jalan Utama (Aspal)
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
    const road = new THREE.Mesh(new THREE.PlaneGeometry(16, 300), roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, -50);
    road.receiveShadow = true;
    this.scene.add(road);

    // Marka Jalan
    const stripeMat = new THREE.MeshLambertMaterial({ color: 0xd4b040 });
    for (let i = 0; i < 40; i++) {
      const zPos = -180 + i * 8;
      if (zPos > -6 && zPos < 6) continue; 
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 3), stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(0, 0.02, zPos);
      this.scene.add(stripe);
    }
  }

  buildMainHouse() {
    const floorMat = new THREE.MeshLambertMaterial({ color: 0xa07f5a });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0.05, 0);
    floor.receiveShadow = true;
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

    // 2. Perumahan (Residential)
    for (const house of data.residential) {
      this.city.createHouse(house.x, house.z, house.width, house.depth, house.color);
    }

    // 3. Gedung Tinggi (Downtown)
    for (const building of data.downtown) {
      this.city.createSkyscraper(building.x, building.z, building.width, building.depth, building.height, building.color);
    }
  }

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
