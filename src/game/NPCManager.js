import * as THREE from 'three';
import { NPC } from './NPC.js'; // File NPC 3D yang udah kita bikin sebelumnya

export class NPCManager {
  constructor(scene, collision) {
    this.scene = scene;
    this.collision = collision;
    this.npcs = []; // Menyimpan semua NPC aktif
  }

  loadNPC(npcData) {
    // 1. Buat model 3D-nya
    const npc3d = new NPC(
      this.scene, 
      npcData.position.x, 
      npcData.position.z, 
      npcData.name, 
      npcData.color, 
      npcData.dialog
    );
    
    // Simpan data logikanya juga
    npc3d.data = npcData; 
    
    // Tambahkan ke collision biar ga bisa ditembus
    this.collision.addBox(
      npcData.position.x - 0.4, 0, npcData.position.z - 0.4,
      npcData.position.x + 0.4, 2, npcData.position.z + 0.4
    );

    this.npcs.push(npc3d);
    
    // Kembalikan data interactable buat UI tombol E
    return {
      type: 'npc',
      npcRef: npc3d,
      position: new THREE.Vector3(npcData.position.x, 0, npcData.position.z),
      radius: npcData.radius,
      label: `Bicara dengan ${npcData.name}`
    };
  }
}
