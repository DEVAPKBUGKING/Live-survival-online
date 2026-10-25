import * as THREE from 'three';

export class World {
  constructor(scene, collision) {
    this.scene = scene;
    this.collision = collision;
  }

  // Dipanggil dengan progress callback supaya loading screen nyata
  async build(onProgress) {
    const steps = 5;
    let done = 0;
    const tick = async (label) => {
      done++;
      if (onProgress) onProgress(done / steps, label);
      // yield ke event loop supaya UI loading sempat render
      await new Promise(r => setTimeout(r, 0));
    };

    this.buildLighting();
    await tick('Menyiapkan cahaya');

    this.buildGround();
    await tick('Membangun jalan');

    this.buildHouse();
    await tick('Membangun rumah');

    this.buildOutside();
    await tick('Menanam pohon');

    this.buildBoundary();
    await tick('Menyelesaikan dunia');
  }

  buildLighting() {
    // Hemisphere ringan: satu draw call, tanpa shadow
    const hemi = new THREE.HemisphereLight(0xaaccff, 0x4a7c3f, 1.0);
    this.scene.add(hemi);

    // Sun directional — shadow 512 + BasicShadowMap (termurah)
    const sun = new THREE.DirectionalLight(0xfff2d5, 1.1);
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

    // Fill tipis
    const fill = new THREE.DirectionalLight(0x88aaff, 0.25);
    fill.position.set(-20, 10, -10);
    this.scene.add(fill);
  }

  buildGround() {
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x5a8f4a });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Road — koridor utama yang dilalui pemain
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x3a3a3a });
    const road = new THREE.Mesh(new THREE.PlaneGeometry(6, 40), roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, -18);
    road.receiveShadow = true;
    this.scene.add(road);

    // Strip kuning tengah
    const stripeMat = new THREE.MeshLambertMaterial({ color: 0xd4b040 });
    for (let i = 0; i < 6; i++) {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 2), stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(0, 0.02, -34 + i * 6);
      this.scene.add(stripe);
    }

    // Trotoar di sisi road
    const sideMat = new THREE.MeshLambertMaterial({ color: 0x9a9a9a });
    const sidewalkL = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 40), sideMat);
    sidewalkL.rotation.x = -Math.PI / 2;
    sidewalkL.position.set(-3.6, 0.02, -18);
    this.scene.add(sidewalkL);

    const sidewalkR = sidewalkL.clone();
    sidewalkR.position.x = 3.6;
    this.scene.add(sidewalkR);
  }

  buildHouse() {
    const floorMat = new THREE.MeshLambertMaterial({ color: 0xa07f5a });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0.02, 0);
    floor.receiveShadow = true;
    this.scene.add(floor);

    const wallMat = new THREE.MeshLambertMaterial({ color: 0xf0e0c0 });
    const wallHeight = 2.8;
    const wallThick = 0.2;

    // Dinding — didaftarkan sebagai collider AABB
    this.addWall(0, wallHeight / 2, -5, 10, wallHeight, wallThick, wallMat);
    this.addWall(-5, wallHeight / 2, 0, wallThick, wallHeight, 10, wallMat);
    this.addWall(5, wallHeight / 2, 0, wallThick, wallHeight, 10, wallMat);

    // Front wall dengan pintu gap 1.2m di tengah
    const segWidth = 4.4;
    this.addWall(-(0.6 + segWidth / 2), wallHeight / 2, 5, segWidth, wallHeight, wallThick, wallMat);
    this.addWall(0.6 + segWidth / 2, wallHeight / 2, 5, segWidth, wallHeight, wallThick, wallMat);
    // Header atas pintu — tidak solid, tapi tetap didaftarkan supaya tidak tembus dari atas
    const header = this.addBox(0, wallHeight - 0.3, 5, 1.2, 0.6, wallThick, wallMat);
    header.castShadow = true;

    const roofMat = new THREE.MeshLambertMaterial({ color: 0x8a3a1a });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.25, 10.8), roofMat);
    roof.position.set(0, wallHeight + 0.15, 0);
    roof.castShadow = true;
    this.scene.add(roof);

    // Bed — collider
    const bedFrame = new THREE.MeshLambertMaterial({ color: 0x6b3e2b });
    const bed = this.addBox(-3.5, 0.25, -3.5, 1.2, 0.5, 2, bedFrame);
    bed.castShadow = true;
    this.collision.addBox(-4.1, 0, -4.5, -2.9, 0.5, -2.5);

    const bedSheet = new THREE.MeshLambertMaterial({ color: 0xe8e8f0 });
    const sheet = this.addBox(-3.5, 0.55, -3.5, 1.1, 0.1, 1.9, bedSheet);
    sheet.castShadow = true;

    // Table — collider
    const tableMat = new THREE.MeshLambertMaterial({ color: 0x5a3e2b });
    const table = this.addBox(3, 0.4, -3, 1.5, 0.08, 0.8, tableMat);
    table.castShadow = true;
    for (const [tx, tz] of [[-0.65, -0.3], [0.65, -0.3], [-0.65, 0.3], [0.65, 0.3]]) {
      this.addBox(3 + tx, 0.2, -3 + tz, 0.08, 0.4, 0.08, tableMat);
    }
    this.collision.addBox(2.25, 0, -3.4, 3.75, 0.5, -2.6);

    // Fridge — collider
    const fridgeMat = new THREE.MeshLambertMaterial({ color: 0xd8d8dc });
    const fridge = this.addBox(4, 0.9, 3, 0.7, 1.8, 0.7, fridgeMat);
    fridge.castShadow = true;
    this.collision.addBox(3.65, 0, 2.65, 4.35, 1.8, 3.35);

    // Kitchen counter — collider
    const counterMat = new THREE.MeshLambertMaterial({ color: 0x8a8a8a });
    const counter = this.addBox(-4, 0.45, 3, 1.8, 0.9, 0.7, counterMat);
    counter.castShadow = true;
    this.collision.addBox(-4.9, 0, 2.65, -3.1, 0.9, 3.35);
  }

  buildOutside() {
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5a3e2b });
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x2d7a2d });

    const treePositions = [[-12, -8], [14, -4], [-16, 6], [18, 10], [-8, 14], [-20, -15], [22, -12]];
    for (const [x, z] of treePositions) {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 2.2, 6), trunkMat);
      trunk.position.set(x, 1.1, z);
      trunk.castShadow = true;
      this.scene.add(trunk);
      this.collision.addBox(x - 0.35, 0, z - 0.35, x + 0.35, 2.2, z + 0.35);

      const leaves = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2.8, 5), leafMat);
      leaves.position.set(x, 3.5, z);
      leaves.castShadow = true;
      this.scene.add(leaves);
    }

    // Bench — collider
    const benchMat = new THREE.MeshLambertMaterial({ color: 0x7a4a2b });
    const b1 = this.addBox(-10, 0.25, 8, 2, 0.08, 0.5, benchMat);
    const b2 = this.addBox(-10, 0.12, 8, 2, 0.25, 0.08, benchMat);
    const b3 = this.addBox(-10.7, 0.2, 8, 0.08, 0.4, 0.5, benchMat);
    const b4 = this.addBox(-9.3, 0.2, 8, 0.08, 0.4, 0.5, benchMat);
    b1.castShadow = b2.castShadow = b3.castShadow = b4.castShadow = true;
    this.collision.addBox(-11, 0, 7.7, -9, 0.5, 8.3);
  }

  buildBoundary() {
    const boundMat = new THREE.MeshLambertMaterial({
      color: 0x2a2a3a, transparent: true, opacity: 0.12
    });
    const h = 3;
    this.addBox(0, h / 2, -38, 78, h, 0.3, boundMat);
    this.addBox(0, h / 2, 38, 78, h, 0.3, boundMat);
    this.addBox(-38, h / 2, 0, 0.3, h, 78, boundMat);
    this.addBox(38, h / 2, 0, 0.3, h, 78, boundMat);

    // Boundary juga collider (pemain tidak bisa keluar)
    this.collision.addBox(-39, 0, -39, 39, h, -37.7);
    this.collision.addBox(-39, 0, 37.7, 39, h, 39);
    this.collision.addBox(-39, 0, -39, -37.7, h, 39);
    this.collision.addBox(37.7, 0, -39, 39, h, 39);
  }

  // Wall: solid + registered as collider
  addWall(x, y, z, w, h, d, material) {
    const mesh = this.addBox(x, y, z, w, h, d, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.collision.addBox(
      x - w / 2, 0, z - d / 2,
      x + w / 2, h, z + d / 2
    );
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
