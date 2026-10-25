import * as THREE from 'three';

export class World {
  constructor(scene, collision, cityData) {
    this.scene = scene;
    this.collision = collision;
    this.cityData = cityData; 
    this.city = { interactables: [] }; 
  }

  async build(onProgress) {
    const steps = 3;
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
    // Tanah / Aspal Dasar (Gede banget biar luas)
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x3a3a3a }); 
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Bikin Jalan Raya Membelah Kota (Lebih panjang)
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x666666 });
    const road = new THREE.Mesh(new THREE.PlaneGeometry(20, 1000), roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, -400);
    this.scene.add(road);

    const roadVert = new THREE.Mesh(new THREE.PlaneGeometry(20, 1000), roadMat);
    roadVert.rotation.x = -Math.PI / 2;
    roadVert.rotation.z = Math.PI / 2;
    roadVert.position.set(0, 0.01, 0);
    this.scene.add(roadVert);

    // Garis Kuning Tengah
    const lineMat = new THREE.MeshLambertMaterial({ color: 0xd4b040 });
    for (let i = 0; i < 100; i++) {
      const zPos = -900 + i * 15;
      if (zPos > -6 && zPos < 6) continue; 
      const line = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 5), lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.02, zPos);
      this.scene.add(line);
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

    // Kasur & Meja
    this.addBox(-3.5, 0.25, -3.5, 1.2, 0.5, 2, new THREE.MeshLambertMaterial({ color: 0x4a6fa5 }));
    this.addBox(3, 0.4, -3, 1.5, 0.08, 0.8, new THREE.MeshLambertMaterial({ color: 0x5a3e2b }));
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
