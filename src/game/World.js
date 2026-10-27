import * as THREE from 'three';
import { Vehicle } from './Vehicle.js';
import { CityMap } from './CityMap.js';
import { Environment } from './Environment.js';
import { CityCucum } from '../data/city/citycucum/CityCucum.js';

export class World {
  constructor(scene, collision) {
    this.scene = scene;
    this.collision = collision;
    this.city = { interactables: [] }; 
  }

  async build(onProgress) {
    const steps = 4;
    let done = 0;
    const tick = async (label) => {
      done++;
      if (onProgress) onProgress(done / steps, label);
      await new Promise(r => setTimeout(r, 0));
    };

    this.buildLighting();
    await tick('Menyiapkan cahaya');
    
    const env = new Environment(this.scene, this.collision);
    env.build();
    await tick('Membangun langit & alam');

    const map = new CityMap(this.scene, this.collision);
    map.build(CityCucum);
    await tick('Membangun jalan & gedung');

    // Mobil
    const car = new Vehicle(this.scene, -90, 130); 
    this.city.interactables.push({
      type: 'vehicle', vehicleRef: car,
      position: new THREE.Vector3(-90, 0, 130), radius: 4, label: 'Nyetir Mobil'
    });
    await tick('Menyiapkan mobil');
  }

  buildLighting() {
    // Pencahayaan Hemat GPU
    const hemi = new THREE.HemisphereLight(0xaaccff, 0x4a7c3f, 0.8);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff2d5, 1.0);
    sun.position.set(50, 80, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024); 
    sun.shadow.camera.left = -150;
    sun.shadow.camera.right = 150;
    sun.shadow.camera.top = 150;
    sun.shadow.camera.bottom = -150;
    sun.shadow.camera.far = 200;
    this.scene.add(sun);
  }

  addTree(x, z) {}
  updateAnimals(dt) {}
}
