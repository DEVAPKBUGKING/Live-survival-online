import * as THREE from 'three';
import { Perumahan } from '../data/city/citycucum/Perumahan.js';

export class CityMap {
  constructor(scene, collision) {
    this.scene = scene;
    this.collision = collision;
  }

  build(cityData) {
    this.buildIslandAndWater(cityData.size);
    this.buildRoads();
    this.buildAirportArea();

    const perumahan = new Perumahan(this.scene, this.collision);

    cityData.buildings.forEach(b => {
      if (b.type === 'house') {
        perumahan.createHouse(b.x, b.z, b.color);
      } else {
        this.createMarker(b);
      }
    });
  }

  buildIslandAndWater(size) {
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 2000),
      new THREE.MeshLambertMaterial({ color: 0x1e90ff })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.5;
    this.scene.add(water);

    const land = new THREE.Mesh(
      new THREE.BoxGeometry(size, 1, size),
      new THREE.MeshLambertMaterial({ color: 0x4a7c3f })
    );
    land.position.y = -0.5;
    land.receiveShadow = true;
    this.scene.add(land);
  }

  buildRoads() {
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
    const sidewalkMat = new THREE.MeshLambertMaterial({ color: 0x999999 });
    const paveMat = new THREE.MeshLambertMaterial({ color: 0x8a7a6a });

    const mainRoadH = new THREE.Mesh(new THREE.PlaneGeometry(350, 20), roadMat);
    mainRoadH.rotation.x = -Math.PI / 2; mainRoadH.position.set(0, 0.02, 0); this.scene.add(mainRoadH);
    
    const swH1 = new THREE.Mesh(new THREE.PlaneGeometry(350, 4), sidewalkMat);
    swH1.rotation.x = -Math.PI / 2; swH1.position.set(0, 0.03, 12); this.scene.add(swH1);
    const swH2 = swH1.clone(); swH2.position.set(0, 0.03, -12); this.scene.add(swH2);

    const mainRoadV = new THREE.Mesh(new THREE.PlaneGeometry(20, 350), roadMat);
    mainRoadV.rotation.x = -Math.PI / 2; mainRoadV.position.set(0, 0.02, 0); this.scene.add(mainRoadV);

    const swV1 = new THREE.Mesh(new THREE.PlaneGeometry(4, 350), sidewalkMat);
    swV1.rotation.x = -Math.PI / 2; swV1.position.set(12, 0.03, 0); this.scene.add(swV1);
    const swV2 = swV1.clone(); swV2.position.set(-12, 0.03, 0); this.scene.add(swV2);

    for (let i = -150; i <= 150; i += 50) {
      if (i === 0) continue; 
      const secH = new THREE.Mesh(new THREE.PlaneGeometry(350, 6), paveMat);
      secH.rotation.x = -Math.PI / 2; secH.position.set(0, 0.01, i); this.scene.add(secH);
      
      const secV = new THREE.Mesh(new THREE.PlaneGeometry(6, 350), paveMat);
      secV.rotation.x = -Math.PI / 2; secV.position.set(i, 0.01, 0); this.scene.add(secV);
    }

    const markMat = new THREE.MeshLambertMaterial({ color: 0xd4b040 });
    for (let i = -160; i <= 160; i += 15) {
      if (Math.abs(i) < 15) continue;
      const mH = new THREE.Mesh(new THREE.PlaneGeometry(8, 1), markMat);
      mH.rotation.x = -Math.PI / 2; mH.position.set(i, 0.04, 0); this.scene.add(mH);
      
      const mV = new THREE.Mesh(new THREE.PlaneGeometry(1, 8), markMat);
      mV.rotation.x = -Math.PI / 2; mV.position.set(0, 0.04, i); this.scene.add(mV);
    }
  }

  buildAirportArea() {
    const airportMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const airportArea = new THREE.Mesh(new THREE.PlaneGeometry(100, 80), airportMat);
    airportArea.rotation.x = -Math.PI / 2;
    airportArea.position.set(-100, 0.01, -150);
    this.scene.add(airportArea);

    const runwayMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const runway = new THREE.Mesh(new THREE.PlaneGeometry(80, 15), runwayMat);
    runway.rotation.x = -Math.PI / 2;
    runway.position.set(-100, 0.02, -150);
    this.scene.add(runway);

    const lineMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    for (let i = -30; i <= 30; i += 10) {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(4, 1), lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(-100 + i, 0.03, -150);
      this.scene.add(line);
    }
  }

  createMarker(loc) {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 5, 8),
      new THREE.MeshLambertMaterial({ color: 0xffaa00 })
    );
    pole.position.set(loc.x, 2.5, loc.z);
    pole.castShadow = true;
    this.scene.add(pole);

    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 32px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`${loc.icon} ${loc.name}`, 256, 50);
    ctx.fillStyle = '#ef4444'; ctx.font = 'bold 24px sans-serif';
    ctx.fillText('Masih dalam pembangunan', 256, 90);

    const tex = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false }));
    sprite.scale.set(20, 5, 1);
    sprite.position.set(loc.x, 7, loc.z);
    this.scene.add(sprite);

    this.collision.addBox(loc.x - 1, 0, loc.z - 1, loc.x + 1, 5, loc.z + 1);
  }
}
