import * as THREE from 'three';

export class World {
  constructor(scene) {
    this.scene = scene;
  }

  build() {
    this.buildLighting();
    this.buildGround();
    this.buildHouse();
    this.buildOutside();
    this.buildBoundary();
  }

  buildLighting() {
    // Hemisphere: sky color ke ground color — pencahayaan lembut & murah
    const hemi = new THREE.HemisphereLight(0xaaccff, 0x4a7c3f, 0.85);
    this.scene.add(hemi);

    // Sun — satu directional dengan shadow map kecil
    const sun = new THREE.DirectionalLight(0xfff2d5, 1.15);
    sun.position.set(30, 50, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -40;
    sun.shadow.camera.right = 40;
    sun.shadow.camera.top = 40;
    sun.shadow.camera.bottom = -40;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 120;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.02;
    this.scene.add(sun);
    this.scene.add(sun.target);
    this.sun = sun;

    // Subtle fill dari bawah untuk hindari area terlalu gelap
    const fill = new THREE.DirectionalLight(0x88aaff, 0.25);
    fill.position.set(-20, 10, -10);
    this.scene.add(fill);
  }

  buildGround() {
    const groundGeo = new THREE.PlaneGeometry(100, 100, 1, 1);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x5a8f4a,
      roughness: 0.95,
      metalness: 0.0
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Road
    const roadGeo = new THREE.PlaneGeometry(6, 40);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x3a3a3a, roughness: 0.85
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, -18);
    road.receiveShadow = true;
    this.scene.add(road);

    // Road stripes
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.7 });
    for (let i = 0; i < 6; i++) {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 2), stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(0, 0.02, -34 + i * 6);
      this.scene.add(stripe);
    }
  }

  buildHouse() {
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xa07f5a, roughness: 0.9 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0.02, 0);
    floor.receiveShadow = true;
    this.scene.add(floor);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf0e0c0, roughness: 0.8 });
    const wallHeight = 2.8;
    const wallThick = 0.2;

    const backWall = this.addBox(0, wallHeight / 2, -5, 10, wallHeight, wallThick, wallMat);
    const leftWall = this.addBox(-5, wallHeight / 2, 0, wallThick, wallHeight, 10, wallMat);
    const rightWall = this.addBox(5, wallHeight / 2, 0, wallThick, wallHeight, 10, wallMat);
    backWall.castShadow = leftWall.castShadow = rightWall.castShadow = true;
    backWall.receiveShadow = leftWall.receiveShadow = rightWall.receiveShadow = true;

    const segWidth = 4.4;
    const fL = this.addBox(-(0.6 + segWidth / 2), wallHeight / 2, 5, segWidth, wallHeight, wallThick, wallMat);
    const fR = this.addBox(0.6 + segWidth / 2, wallHeight / 2, 5, segWidth, wallHeight, wallThick, wallMat);
    const fTop = this.addBox(0, wallHeight - 0.3, 5, 1.2, 0.6, wallThick, wallMat);
    fL.castShadow = fR.castShadow = fTop.castShadow = true;

    const roofMat = new THREE.MeshStandardMaterial({ color: 0x8a3a1a, roughness: 0.8 });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.25, 10.8), roofMat);
    roof.position.set(0, wallHeight + 0.15, 0);
    roof.castShadow = true;
    roof.receiveShadow = true;
    this.scene.add(roof);

    // Bed
    const bedFrame = new THREE.MeshStandardMaterial({ color: 0x6b3e2b, roughness: 0.9 });
    const bedSheet = new THREE.MeshStandardMaterial({ color: 0xe8e8f0, roughness: 0.95 });
    const bed = this.addBox(-3.5, 0.25, -3.5, 1.2, 0.5, 2, bedFrame);
    const sheet = this.addBox(-3.5, 0.55, -3.5, 1.1, 0.1, 1.9, bedSheet);
    bed.castShadow = sheet.castShadow = true;

    // Table
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x5a3e2b, roughness: 0.85 });
    const table = this.addBox(3, 0.4, -3, 1.5, 0.08, 0.8, tableMat);
    table.castShadow = true;
    for (const [tx, tz] of [[-0.65, -0.3], [0.65, -0.3], [-0.65, 0.3], [0.65, 0.3]]) {
      this.addBox(3 + tx, 0.2, -3 + tz, 0.08, 0.4, 0.08, tableMat);
    }

    // Fridge
    const fridgeMat = new THREE.MeshStandardMaterial({ color: 0xd8d8dc, roughness: 0.4, metalness: 0.2 });
    const fridge = this.addBox(4, 0.9, 3, 0.7, 1.8, 0.7, fridgeMat);
    fridge.castShadow = true;

    // Kitchen counter
    const counterMat = new THREE.MeshStandardMaterial({ color: 0x8a8a8a, roughness: 0.7 });
    const counter = this.addBox(-4, 0.45, 3, 1.8, 0.9, 0.7, counterMat);
    counter.castShadow = true;
  }

  buildOutside() {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3e2b, roughness: 0.95 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2d7a2d, roughness: 0.9 });

    const treePositions = [[-12, -8], [14, -4], [-16, 6], [18, 10], [-8, 14], [-20, -15], [22, -12]];
    for (const [x, z] of treePositions) {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 2.2, 8), trunkMat);
      trunk.position.set(x, 1.1, z);
      trunk.castShadow = true;
      this.scene.add(trunk);

      const leaves = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2.8, 7), leafMat);
      leaves.position.set(x, 3.5, z);
      leaves.castShadow = true;
      this.scene.add(leaves);
    }

    // Bench
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x7a4a2b, roughness: 0.85 });
    const b1 = this.addBox(-10, 0.25, 8, 2, 0.08, 0.5, benchMat);
    const b2 = this.addBox(-10, 0.12, 8, 2, 0.25, 0.08, benchMat);
    const b3 = this.addBox(-10.7, 0.2, 8, 0.08, 0.4, 0.5, benchMat);
    const b4 = this.addBox(-9.3, 0.2, 8, 0.08, 0.4, 0.5, benchMat);
    b1.castShadow = b2.castShadow = b3.castShadow = b4.castShadow = true;
  }

  buildBoundary() {
    const boundMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a3a, transparent: true, opacity: 0.15, roughness: 1
    });
    const h = 3;
    this.addBox(0, h / 2, -38, 78, h, 0.3, boundMat);
    this.addBox(0, h / 2, 38, 78, h, 0.3, boundMat);
    this.addBox(-38, h / 2, 0, 0.3, h, 78, boundMat);
    this.addBox(38, h / 2, 0, 0.3, h, 78, boundMat);
  }

  addBox(x, y, z, w, h, d, material) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    return mesh;
  }
}
