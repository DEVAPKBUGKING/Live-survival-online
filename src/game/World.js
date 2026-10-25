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
    // Ambient Light untuk dasar yang terang
    const hemi = new THREE.HemisphereLight(0xaaccff, 0x4a7c3f, 1.2);
    this.scene.add(hemi);

    // Sunlight (PCF Soft Shadow)
    const sun = new THREE.DirectionalLight(0xfff2d5, 1.5);
    sun.position.set(30, 50, 20);
    sun.castShadow = true;
    
    // Resolusi bayangan lebih tinggi dikit biar ga kaku
    sun.shadow.mapSize.set(1024, 1024); 
    sun.shadow.camera.left = -45;
    sun.shadow.camera.right = 45;
    sun.shadow.camera.top = 45;
    sun.shadow.camera.bottom = -45;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 120;
    sun.shadow.bias = -0.0005; // Ngurangin bayangan bergaris (acne)
    
    this.scene.add(sun);

    // Fill light biar bagian gelap ga terlalu hitam
    const fill = new THREE.DirectionalLight(0x88aaff, 0.4);
    fill.position.set(-20, 10, -10);
    this.scene.add(fill);
    
    // Lampu di dalam rumah biar ga gelap gulita
    const roomLight = new THREE.PointLight(0xffeedd, 1.5, 20);
    roomLight.position.set(0, 2.5, 0);
    this.scene.add(roomLight);
  }

  buildGround() {
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x5a8f4a });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const roadMat = new THREE.MeshLambertMaterial({ color: 0x3a3a3a });
    const road = new THREE.Mesh(new THREE.PlaneGeometry(6, 40), roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, -18);
    road.receiveShadow = true;
    this.scene.add(road);

    const stripeMat = new THREE.MeshLambertMaterial({ color: 0xd4b040 });
    for (let i = 0; i < 6; i++) {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 2), stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(0, 0.02, -34 + i * 6);
      this.scene.add(stripe);
    }

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

    this.addWall(0, wallHeight / 2, -5, 10, wallHeight, wallThick, wallMat);
    this.addWall(-5, wallHeight / 2, 0, wallThick, wallHeight, 10, wallMat);
    this.addWall(5, wallHeight / 2, 0, wallThick, wallHeight, 10, wallMat);

    const segWidth = 4.4;
    this.addWall(-(0.6 + segWidth / 2), wallHeight / 2, 5, segWidth, wallHeight, wallThick, wallMat);
    this.addWall(0.6 + segWidth / 2, wallHeight / 2, 5, segWidth, wallHeight, wallThick, wallMat);
    const header = this.addBox(0, wallHeight - 0.3, 5, 1.2, 0.6, wallThick, wallMat);
    header.castShadow = true;

    // ROOF FIX: Dibikin lebih lebar biar nutupin dinding
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x8a3a1a });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.3, 10.8), roofMat);
    roof.position.set(0, wallHeight + 0.15, 0);
    roof.castShadow = true;
    roof.receiveShadow = true;
    this.scene.add(roof);

    const bedFrame = new THREE.MeshLambertMaterial({ color: 0x6b3e2b });
    const bed = this.addBox(-3.5, 0.25, -3.5, 1.2, 0.5, 2, bedFrame);
    bed.castShadow = true;
    this.collision.addBox(-4.1, 0, -4.5, -2.9, 0.5, -2.5);

    const bedSheet = new THREE.MeshLambertMaterial({ color: 0xe8e8f0 });
    const sheet = this.addBox(-3.5, 0.55, -3.5, 1.1, 0.1, 1.9, bedSheet);
    sheet.castShadow = true;

    const tableMat = new THREE.MeshLambertMaterial({ color: 0x5a3e2b });
    const table = this.addBox(3, 0.4, -3, 1.5, 0.08, 0.8, tableMat);
    table.castShadow = true;
    for (const [tx, tz] of [[-0.65, -0.3], [0.65, -0.3], [-0.65, 0.3], [0.65, 0.3]]) {
      this.addBox(3 + tx, 0.2, -3 + tz, 0.08, 0.4, 0.08, tableMat);
    }
    this.collision.addBox(2.25, 0, -3.4, 3.75, 0.5, -2.6);

    const fridgeMat = new THREE.MeshLambertMaterial({ color: 0xd8d8dc });
    const fridge = this.addBox(4, 0.9, 3, 0.7, 1.8, 0.7, fridgeMat);
    fridge.castShadow = true;
    this.collision.addBox(3.65, 0, 2.65, 4.35, 1.8, 3.35);

    const counterMat = new THREE.MeshLambertMaterial({ color: 0x8a8a8a });
    const counter = this.addBox(-4, 0.45, 3, 1.8, 0.9, 0.7, counterMat);
    counter.castShadow = true;
    this.collision.addBox(-4.9, 0, 2.65, -3.1, 0.9, 3.35);
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
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2 * scale, 0.28 * scale, 2.2 * scale, 8),
        trunkMat
      );
      trunk.position.set(x, 1.1 * scale, z);
      trunk.castShadow = true;
      this.scene.add(trunk);
      this.collision.addBox(x - 0.3, 0, z - 0.3, x + 0.3, 2.2 * scale, z + 0.3);

      const leafMat = leafMats[Math.floor(Math.random() * leafMats.length)];
      const layers = 3;
      for (let i = 0; i < layers; i++) {
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

  buildNature() {
    const grassMat = new THREE.MeshLambertMaterial({ color: 0x6aaa4a, side: THREE.DoubleSide });
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 8 + Math.random() * 28;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      if (Math.abs(x) < 5.5 && Math.abs(z) < 5.5) continue;
      const blade = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.4), grassMat);
      blade.position.set(x, 0.2, z);
      blade.rotation.y = Math.random() * Math.PI;
      this.scene.add(blade);
    }

    const rockMat = new THREE.MeshLambertMaterial({ color: 0x7a7a7a });
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 10 + Math.random() * 25;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      if (Math.abs(x) < 5.5 && Math.abs(z) < 5.5) continue;
      const s = 0.2
