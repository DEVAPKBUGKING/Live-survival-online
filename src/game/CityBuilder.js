import * as THREE from 'three';

export class CityBuilder {
  constructor(scene, collision) {
    this.scene = scene;
    this.collision = collision;
    this.interactables = [];
  }

  createRoad(x, z, width, length, isVertical = false) {
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
    const road = new THREE.Mesh(new THREE.PlaneGeometry(width, length), roadMat);
    road.rotation.x = -Math.PI / 2;
    if (isVertical) road.rotation.z = Math.PI / 2;
    road.position.set(x, 0.01, z);
    road.receiveShadow = true;
    this.scene.add(road);

    // Trotoar (Sidewalk)
    const walkMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
    const sw1 = new THREE.Mesh(new THREE.PlaneGeometry(1.5, length), walkMat);
    sw1.rotation.x = -Math.PI / 2;
    if (isVertical) sw1.rotation.z = Math.PI / 2;
    sw1.position.set(x + (isVertical ? 0 : width/2 + 0.75), 0.02, z + (isVertical ? length/2 + 0.75 : 0));
    this.scene.add(sw1);

    const sw2 = sw1.clone();
    sw2.position.set(x - (isVertical ? 0 : width/2 + 0.75), 0.02, z - (isVertical ? length/2 + 0.75 : 0));
    this.scene.add(sw2);
  }

  createSkyscraper(x, z, width, depth, height, color) {
    const mat = new THREE.MeshLambertMaterial({ color });
    const geo = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, height / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.collision.addBox(x - width/2, 0, z - depth/2, x + width/2, height, z + depth/2);

    // Jendela
    const windowMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    for (let i = 2; i < height - 2; i += 4) {
      const windowGeo = new THREE.BoxGeometry(width + 0.1, 1.5, depth + 0.1);
      const windowMesh = new THREE.Mesh(windowGeo, windowMat);
      windowMesh.position.set(x, i, z);
      this.scene.add(windowMesh);
    }
    return mesh;
  }

  createHouse(x, z, width, depth, color) {
    const h = 4;
    const wallMat = new THREE.MeshLambertMaterial({ color });
    const house = new THREE.Mesh(new THREE.BoxGeometry(width, h, depth), wallMat);
    house.position.set(x, h / 2, z);
    house.castShadow = true;
    this.scene.add(house);
    this.collision.addBox(x - width/2, 0, z - depth/2, x + width/2, h, z + depth/2);

    const roofMat = new THREE.MeshLambertMaterial({ color: 0x8a3a1a });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(width * 0.8, 3, 4), roofMat);
    roof.position.set(x, h + 1.5, z);
    roof.rotation.y = Math.PI / 4; 
    this.scene.add(roof);

    const doorMat = new THREE.MeshLambertMaterial({ color: 0x3a2a1a });
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.5, 0.2), doorMat);
    door.position.set(x, 1.25, z + depth/2);
    this.scene.add(door);
  }

  createAirport(x, z) {
    const group = new THREE.Group();
    const buildingMat = new THREE.MeshLambertMaterial({ color: 0xcccccc });
    const building = new THREE.Mesh(new THREE.BoxGeometry(30, 10, 20), buildingMat);
    building.position.y = 5;
    group.add(building);

    const tower = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 20, 8), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    tower.position.set(0, 10, 0);
    group.add(tower);

    const glass = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 3, 8), new THREE.MeshLambertMaterial({ color: 0x3b82f6 }));
    glass.position.set(0, 18, 0);
    group.add(glass);

    const runway = new THREE.Mesh(new THREE.PlaneGeometry(15, 60), new THREE.MeshLambertMaterial({ color: 0x222222 }));
    runway.rotation.x = -Math.PI / 2;
    runway.position.set(0, 0.02, 30);
    group.add(runway);

    group.position.set(x, 0, z);
    this.scene.add(group);
    this.collision.addBox(x - 15, 0, z - 10, x + 15, 10, z + 10);

    this.interactables.push({
      type: 'airport',
      position: new THREE.Vector3(x, 0, z + 15),
      radius: 6
    });
  }

  createSubway(x, z) {
    const group = new THREE.Group();
    const station = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 8), new THREE.MeshLambertMaterial({ color: 0x666666 }));
    station.position.y = 2.5;
    group.add(station);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.5, 8.5), new THREE.MeshLambertMaterial({ color: 0x3b82f6 }));
    roof.position.y = 5.25;
    group.add(roof);

    group.position.set(x, 0, z);
    this.scene.add(group);
    this.collision.addBox(x - 4, 0, z - 4, x + 4, 5, z + 4);

    this.interactables.push({
      type: 'subway',
      position: new THREE.Vector3(x, 0, z + 6),
      radius: 6
    });
  }
}
