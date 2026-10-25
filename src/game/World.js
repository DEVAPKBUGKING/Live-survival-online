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
    const steps = 5;
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
    await tick('Membangun Main House');
    this.buildCityStructures();
    await tick('Membangun gedung kota');
    this.buildNature();
    await tick('Menanam pohon & rumput');
  }

  buildLighting() {
    const hemi = new THREE.HemisphereLight(0xaaccff, 0x4a7c3f, 1.2);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff2d5, 1.2);
    sun.position.set(30, 50, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(512, 512); 
    sun.shadow.camera.left = -100;
    sun.shadow.camera.right = 100;
    sun.shadow.camera.top = 100;
    sun.shadow.camera.bottom = -100;
    sun.shadow.camera.far = 200;
    sun.shadow.bias = -0.001; 
    this.scene.add(sun);

    // Cahaya di dalam rumah
    const roomLight = new THREE.PointLight(0xffeedd, 1.5, 20);
    roomLight.position.set(0, 2.5, 0);
    this.scene.add(roomLight);
  }

  buildGround() {
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x5a8f4a });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Jalan Aspal
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
    const road = new THREE.Mesh(new THREE.PlaneGeometry(12, 200), roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, -50);
    road.receiveShadow = true;
    this.scene.add(road);

    // Marka Jalan (Hanya di luar rumah)
    const stripeMat = new THREE.MeshLambertMaterial({ color: 0xd4b040 });
    for (let i = 0; i < 25; i++) {
      const zPos = -100 + i * 8;
      if (zPos > -6 && zPos < 6) continue; 
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 3), stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(0, 0.02, zPos);
      this.scene.add(stripe);
    }
  }

  buildHouse() {
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

    // Kasur
    this.addBox(-3.5, 0.25, -3.5, 1.2, 0.5, 2, new THREE.MeshLambertMaterial({ color: 0x4a6fa5 }));
    // Meja
    this.addBox(3, 0.4, -3, 1.5, 0.08, 0.8, new THREE.MeshLambertMaterial({ color: 0x5a3e2b }));
  }

  buildCityStructures() {
    this.city.createAirport(this.cityData.airport.x, this.cityData.airport.z);
    this.city.createSubway(this.cityData.subway.x, this.cityData.subway.z);
    
    const colors = [0x8a8a8a, 0x6a7a8a, 0x7a6a6a, 0x9a9a8a];
    for (let z = -80; z < -10; z += 20) {
      this.city.createSkyscraper(-25, z, 15, 15, 20 + Math.random() * 20, colors[0]);
      this.city.createSkyscraper(25, z, 15, 15, 15 + Math.random() * 25, colors[1]);
    }
  }

  buildNature() {
    const treePositions = [
      [-12, -8], [14, -4], [-16, 6], [18, 10], [-8, 14],
      [-20, -15], [22, -12], [-14, 18], [26, 2], [10, -20]
    ];

    for (const [x, z] of treePositions) {
      this.addTree(x, z);
    }

    // Rumput 3D
    const grassMat = new THREE.MeshLambertMaterial({ color: 0x4caf50, side: THREE.DoubleSide });
    const grassGeo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -0.1, 0, 0,   0.1, 0, 0,   0, 0.5, 0,
      0, 0, -0.1,   0, 0, 0.1,   0, 0.5, 0
    ]);
    grassGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    grassGeo.computeVertexNormals();

    for (let i = 0; i < 200; i++) {
      const x = (Math.random() - 0.5) * 120;
      const z = (Math.random() - 0.5) * 120;
      if (Math.abs(x) < 8 || Math.abs(z) < 10) continue; 

      const blade = new THREE.Mesh(grassGeo, grassMat);
      blade.position.set(x, 0, z);
      blade.rotation.y = Math.random() * Math.PI;
      blade.scale.setScalar(0.5 + Math.random() * 0.8);
      this.scene.add(blade);
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
