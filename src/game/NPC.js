import * as THREE from 'three';

export class NPC {
  constructor(scene, x, z, name, color, dialogData) {
    this.scene = scene;
    this.name = name;
    this.dialogData = dialogData;
    this.currentDialogIndex = 0;
    this.mesh = null;
    
    this.build(x, z, color);
  }

  build(x, z, color) {
    this.mesh = new THREE.Group();

    // Badan
    const bodyMat = new THREE.MeshLambertMaterial({ color });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.9, 0.4), bodyMat);
    body.position.y = 1.0;
    body.castShadow = true;
    this.mesh.add(body);

    // Kepala
    const headMat = new THREE.MeshLambertMaterial({ color: 0xf0c8a0 });
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), headMat);
    head.position.y = 1.65;
    head.castShadow = true;
    this.mesh.add(head);

    // Kaki
    const legMat = new THREE.MeshLambertMaterial({ color: 0x2a2a3a });
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.2), legMat);
    legL.position.set(-0.15, 0.3, 0);
    this.mesh.add(legL);
    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.2), legMat);
    legR.position.set(0.15, 0.3, 0);
    this.mesh.add(legR);

    // Name Tag
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 12, 256, 40);
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.name, 128, 32);
    
    const tex = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
    const nameTag = new THREE.Sprite(spriteMat);
    nameTag.scale.set(2, 0.5, 1);
    nameTag.position.y = 2.2;
    this.mesh.add(nameTag);

    this.mesh.position.set(x, 0, z);
    this.scene.add(this.mesh);
  }

  getNextDialog() {
    const d = this.dialogData[this.currentDialogIndex];
    if (this.dialogData.length > 1) {
      this.currentDialogIndex = (this.currentDialogIndex + 1) % this.dialogData.length;
    }
    return d;
  }
}
