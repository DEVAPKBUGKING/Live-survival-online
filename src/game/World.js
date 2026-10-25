import * as THREE from 'three';

export class World {
  constructor(scene) {
    this.scene = scene;
  }

  build() {
    this.buildGround();
    this.buildHouse();
    this.buildOutside();
    this.buildBoundary();
  }

  buildGround() {
    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x4a7c3f });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);

    const roadGeo = new THREE.PlaneGeometry(6, 40);
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x3a3a3a });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, -18);
    this.scene.add(road);
  }

  buildHouse() {
    const floorGeo = new THREE.PlaneGeometry(10, 10);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x8b7355 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0.02, 0);
    this.scene.add(floor);

    const wallMat = new THREE.MeshLambertMaterial({ color: 0xd4c4a8 });
    const wallHeight = 2.8;
    const wallThick = 0.2;

    // Back, left, right
    this.addBox(0, wallHeight / 2, -5, 10, wallHeight, wallThick, wallMat);
    this.addBox(-5, wallHeight / 2, 0, wallThick, wallHeight, 10, wallMat);
    this.addBox(5, wallHeight / 2, 0, wallThick, wallHeight, 10, wallMat);

    // Front wall with door gap
    const segWidth = 4.4;
    this.addBox(-(0.6 + segWidth / 2), wallHeight / 2, 5, segWidth, wallHeight, wallThick, wallMat);
    this.addBox(0.6 + segWidth / 2, wallHeight / 2, 5, segWidth, wallHeight, wallThick, wallMat);
    this.addBox(0, wallHeight - 0.3, 5, 1.2, 0.6, wallThick, wallMat);

    // Roof
    const roofGeo = new THREE.BoxGeometry(10.4, 0.15, 10.4);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x6b4423 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, wallHeight + 0.075, 0);
    this.scene.add(roof);

    // Bed
    const bedMat = new THREE.MeshLambertMaterial({ color: 0x4a6fa5 });
    this.addBox(-3.5, 0.25, -3.5, 1.2, 0.5, 2, bedMat);
    this.addBox(-3.5, 0.55, -3.5, 1.1, 0.1, 1.9, new THREE.MeshLambertMaterial({ color: 0xe8e8f0 }));

    // Table
    const tableMat = new THREE.MeshLambertMaterial({ color: 0x5a3e2b });
    this.addBox(3, 0.4, -3, 1.5, 0.08, 0.8, tableMat);
    for (const [tx, tz] of [[-0.65, -0.3], [0.65, -0.3], [-0.65, 0.3], [0.65, 0.3]]) {
      this.addBox(3 + tx, 0.2, -3 + tz, 0.08, 0.4, 0.08, tableMat);
    }

    // Fridge
    this.addBox(4, 0.9, 3, 0.7, 1.8, 0.7, new THREE.MeshLambertMaterial({ color: 0xcccccc }));

    // Kitchen counter
    this.addBox(-4, 0.45, 3, 1.8, 0.9, 0.7, new THREE.MeshLambertMaterial({ color: 0x888888 }));
  }

  buildOutside() {
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5a3e2b });
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x2d6a2d });

    const treePositions = [[-12, -8], [14, -4], [-16, 6], [18, 10], [-8, 14]];
    for (const [x, z] of treePositions) {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 2), trunkMat);
      trunk.position.set(x, 1, z);
      this.scene.add(trunk);

      const leaves = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2.5, 6), leafMat);
      leaves.position.set(x, 3.2, z);
      this.scene.add(leaves);
    }

    // Bench
    const benchMat = new THREE.MeshLambertMaterial({ color: 0x6b4423 });
    this.addBox(-10, 0.25, 8, 2, 0.08, 0.5, benchMat);
    this.addBox(-10, 0.12, 8, 2, 0.25, 0.08, benchMat);
    this.addBox(-10.7, 0.2, 8, 0.08, 0.4, 0.5, benchMat);
    this.addBox(-9.3, 0.2, 8, 0.08, 0.4, 0.5, benchMat);
  }

  buildBoundary() {
    const boundMat = new THREE.MeshLambertMaterial({
      color: 0x2a2a3a, transparent: true, opacity: 0.3
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
    this.scene.add(mesh);
    return mesh;
  }
}
