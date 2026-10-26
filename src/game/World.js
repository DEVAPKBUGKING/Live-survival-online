import * as THREE from 'three';
import { Vehicle } from './Vehicle.js';
import { CityMap } from './CityMap.js';
import { CityCucum } from '../data/city/CityCucum.js';

export class World {
  constructor(scene, collision, cityData) {
    this.scene = scene;
    this.collision = collision;
    this.cityData = cityData; 
    this.city = { interactables: [] }; 
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
    // this.buildGroundAndRoads();
        // Panggil map Cucum
    const map = new CityMap(this.scene, this.collision);
    map.build(CityCucum);
    await tick('Membangun jalan raya');
    this.buildMainHouse();
    await tick('Membangun Main House');
    this.buildCityStructures();
    await tick('Membangun gedung kota');
    this.buildNature();
    await tick('Menanam pohon & rumput');
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
    // Tanah hijau
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x4a7c3f }); 
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Jalan Raya Aspal
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const road = new THREE.Mesh(new THREE.PlaneGeometry(20, 600), roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, -200);
    road.receiveShadow = true;
    this.scene.add(road);

    // Trotoar Kiri & Kanan
    const sidewalkMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
    const swLeft = new THREE.Mesh(new THREE.PlaneGeometry(3, 600), sidewalkMat);
    swLeft.rotation.x = -Math.PI / 2;
    swLeft.position.set(-11.5, 0.02, -200);
    this.scene.add(swLeft);
    
    const swRight = new THREE.Mesh(new THREE.PlaneGeometry(3, 600), sidewalkMat);
    swRight.rotation.x = -Math.PI / 2;
    swRight.position.set(11.5, 0.02, -200);
    this.scene.add(swRight);
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

    // Atap
    const roof = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.3, 10.8), new THREE.MeshLambertMaterial({ color: 0x8a3a1a }));
    roof.position.set(0, h + 0.15, 0);
    roof.castShadow = true;
    this.scene.add(roof);
    
    // Kasur & Meja
    this.addBox(-3.5, 0.25, -3.5, 1.2, 0.5, 2, new THREE.MeshLambertMaterial({ color: 0x4a6fa5 }));
    this.addBox(3, 0.4, -3, 1.5, 0.08, 0.8, new THREE.MeshLambertMaterial({ color: 0x5a3e2b }));
  }

  buildCityStructures() {
    const buildingMat = new THREE.MeshLambertMaterial({ color: 0x8a8a8a });

    // Looping bikin gedung tinggi kiri-kanan jalan
    for (let i = 0; i < 15; i++) {
      const zPos = -30 - (i * 25); // Mulai dari depan rumah (-30) sampai jauh (-405)
      const height1 = 30 + Math.random() * 40;
      const height2 = 30 + Math.random() * 40;

      // Gedung Kiri
      const bLeft = new THREE.Mesh(new THREE.BoxGeometry(20, height1, 20), buildingMat);
      bLeft.position.set(-30, height1 / 2, zPos);
      bLeft.castShadow = true;
      this.scene.add(bLeft);
      this.collision.addBox(-40, 0, zPos - 10, -20, height1, zPos + 10);

      // Gedung Kanan
      const bRight = new THREE.Mesh(new THREE.BoxGeometry(20, height2, 20), buildingMat);
      bRight.position.set(30, height2 / 2, zPos);
      bRight.castShadow = true;
      this.scene.add(bRight);
      this.collision.addBox(20, 0, zPos - 10, 40, height2, zPos + 10);

      // Jendela (Kotak hitam tipis)
      const windowMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
      const winLeft = new THREE.Mesh(new THREE.BoxGeometry(20.2, height1 * 0.8, 20.2), windowMat);
      winLeft.position.set(-30, height1 / 2, zPos);
      this.scene.add(winLeft);

      const winRight = new THREE.Mesh(new THREE.BoxGeometry(20.2, height2 * 0.8, 20.2), windowMat);
      winRight.position.set(30, height2 / 2, zPos);
      this.scene.add(winRight);
    }

    // ==========================================
    // SPAWN MOBIL DI DEPAN RUMAH
    // ==========================================
    const car = new Vehicle(this.scene, 3, 8); // X=3 (kanan), Z=8 (depan rumah)
    
    this.city.interactables.push({
      type: 'vehicle',
      vehicleRef: car,
      position: new THREE.Vector3(3, 0, 8),
      radius: 4,
      label: 'Nyetir Mobil'
    });
  }

  buildNature() {
    // Pohon-pohon di pinggir trotoar
    for (let i = 0; i < 20; i++) {
      const zPos = -15 - (i * 20);
      this.addTree(-13, zPos);
      this.addTree(13, zPos);
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
      const x = (Math.random() - 0.5) * 150;
      const z = (Math.random() - 0.5) * 400;
      // Jangan taruh rumput di jalan atau di dalam rumah
      if (Math.abs(x) < 15 || Math.abs(z) < 10) continue; 

      const blade = new THREE.Mesh(grassGeo, grassMat);
      blade.position.set(x, 0, z);
      blade.rotation.y = Math.random() * Math.PI;
      blade.scale.setScalar(0.5 + Math.random() * 0.8);
      this.scene.add(blade);
    }

    // Batu-batu kecil
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x7a7a7a });
    for (let i = 0; i < 50; i++) {
      const x = (Math.random() - 0.5) * 150;
      const z = (Math.random() - 0.5) * 400;
      if (Math.abs(x) < 15 || Math.abs(z) < 10) continue;
      
      const s = 0.2 + Math.random() * 0.2; 
      const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), rockMat);
      rock.position.set(x, s * 0.5, z);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      this.scene.add(rock);
      this.collision.addBox(x - s, 0, z - s, x + s, s * 2, z + s);
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

  updateAnimals(dt) { }

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
