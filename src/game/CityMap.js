import * as THREE from 'three';
import { Perumahan } from '../data/city/citycucum/Perumahan.js';
import { Supermarket } from '../data/city/citycucum/Supermarket.js';
import { BalaiKota } from '../data/city/citycucum/BalaiKota.js';

export class CityMap {
  constructor(scene, collision) {
    this.scene = scene;
    this.collision = collision;
  }

  build(cityData) {
    this.buildIslandAndWater(cityData.size);
    this.buildRoadsAndSidewalks();

    // Inisialisasi Bangunan yang udah lu bikin
    const perumahan = new Perumahan(this.scene, this.collision);
    const supermarket = new Supermarket(this.scene, this.collision);
    const balaiKota = new BalaiKota(this.scene, this.collision);

    cityData.buildings.forEach(b => {
      if (b.type === 'house') {
        perumahan.createHouse(b.x, b.z, b.style, b.color);
      } else if (b.name === 'Supermarket') {
        supermarket.create(b.x, b.z);
      } else if (b.name === 'Balai Kota') {
        balaiKota.create(b.x, b.z);
      } else {
        this.createMarker(b);
      }
    });
  }

  buildIslandAndWater(size) {
    // Air bergelombang sikit (pakai Plane biasa biar enteng)
    const waterMat = new THREE.MeshLambertMaterial({ color: 0x4b8ba6, transparent: true, opacity: 0.8 });
    const water = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.5;
    this.scene.add(water);

    // Daratan
    const landMat = new THREE.MeshLambertMaterial({ color: 0x558c4a });
    const land = new THREE.Mesh(new THREE.BoxGeometry(size, 1, size), landMat);
    land.position.y = -0.5;
    land.receiveShadow = true;
    this.scene.add(land);
  }

  buildRoadsAndSidewalks() {
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const sidewalkMat = new THREE.MeshLambertMaterial({ color: 0x888888 });

    // Jalan Utama
    const mainRoadH = new THREE.Mesh(new THREE.BoxGeometry(350, 0.1, 20), roadMat);
    mainRoadH.position.set(0, 0, 0); mainRoadH.receiveShadow = true; this.scene.add(mainRoadH);
    
    const mainRoadV = new THREE.Mesh(new THREE.BoxGeometry(20, 0.1, 350), roadMat);
    mainRoadV.position.set(0, 0, 0); mainRoadV.receiveShadow = true; this.scene.add(mainRoadV);

    // Trotoar Timbul (Bikin kelihatan 3D)
    const swH1 = new THREE.Mesh(new THREE.BoxGeometry(350, 0.2, 4), sidewalkMat);
    swH1.position.set(0, 0.1, 12); swH1.receiveShadow = true; this.scene.add(swH1);
    const swH2 = swH1.clone(); swH2.position.set(0, 0.1, -12); this.scene.add(swH2);

    const swV1 = new THREE.Mesh(new THREE.BoxGeometry(4, 0.2, 350), sidewalkMat);
    swV1.position.set(12, 0.1, 0); swV1.receiveShadow = true; this.scene.add(swV1);
    const swV2 = swV1.clone(); swV2.position.set(-12, 0.1, 0); this.scene.add(swV2);

    // Marka Jalan
    const markMat = new THREE.MeshBasicMaterial({ color: 0xdddddd });
    for (let i = -160; i <= 160; i += 20) {
      if (Math.abs(i) < 20) continue;
      const mH = new THREE.Mesh(new THREE.PlaneGeometry(8, 0.6), markMat);
      mH.rotation.x = -Math.PI / 2; mH.position.set(i, 0.06, 0); this.scene.add(mH);
      
      const mV = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 8), markMat);
      mV.rotation.x = -Math.PI / 2; mV.position.set(0, 0.06, i); this.scene.add(mV);
    }
  }

  createMarker(loc) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 5, 6), new THREE.MeshLambertMaterial({ color: 0xffaa00 }));
    pole.position.set(loc.x, 2.5, loc.z); pole.castShadow = true; this.scene.add(pole);

    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`Masih dalam pembangunan`, 128, 35);

    const tex = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false }));
    sprite.scale.set(10, 2.5, 1); sprite.position.set(loc.x, 6, loc.z); this.scene.add(sprite);

    this.collision.addBox(loc.x - 0.5, 0, loc.z - 0.5, loc.x + 0.5, 5, loc.z + 0.5);
  }
}
