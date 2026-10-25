import * as THREE from 'three';

function makeNameSprite(name) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.font = 'bold 32px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 12, canvas.width, 40);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(name, canvas.width / 2, canvas.height / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(1.6, 0.4, 1);
  sprite.position.y = 2.3;
  return sprite;
}

function buildCharacter(name, color) {
  const group = new THREE.Group();

  // Body
  const bodyMat = new THREE.MeshLambertMaterial({ color });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.8, 0.32), bodyMat);
  body.position.y = 1.1;
  body.castShadow = true;
  group.add(body);

  // Head
  const headMat = new THREE.MeshLambertMaterial({ color: 0xf0c8a0 });
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.32), headMat);
  head.position.y = 1.68;
  head.castShadow = true;
  group.add(head);

  // Legs
  const legMat = new THREE.MeshLambertMaterial({ color: 0x2a2a3a });
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 0.22), legMat);
  legL.position.set(-0.16, 0.35, 0);
  legL.castShadow = true;
  group.add(legL);

  const legR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 0.22), legMat);
  legR.position.set(0.16, 0.35, 0);
  legR.castShadow = true;
  group.add(legR);

  // Arms
  const armMat = new THREE.MeshLambertMaterial({ color });
  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.7, 0.16), armMat);
  armL.position.set(-0.37, 1.15, 0);
  armL.castShadow = true;
  group.add(armL);

  const armR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.7, 0.16), armMat);
  armR.position.set(0.37, 1.15, 0);
  armR.castShadow = true;
  group.add(armR);

  // Name tag
  const tag = makeNameSprite(name);
  group.add(tag);

  return { group, legL, legR, armL, armR };
}

function colorFromId(clientId) {
  // Hash clientId → hue
  let h = 0;
  for (let i = 0; i < clientId.length; i++) h = (h * 31 + clientId.charCodeAt(i)) & 0xffffffff;
  const hue = (h % 360) / 360;
  const c = new THREE.Color();
  c.setHSL(hue, 0.6, 0.55);
  return c.getHex();
}

export class PlayerSync {
  constructor(scene, camera, rooms) {
    this.scene = scene;
    this.camera = camera;
    this.rooms = rooms;
    this.others = new Map(); // clientId -> { group, legL, legR, armL, armR, target, lastSend }
    this.localClientId = rooms.currentPlayer?.client_id;
    this.lastSend = 0;
    this.sendInterval = 100; // ms
    this.walkPhase = 0;
    this.unsubs = [];

    // Dengarkan broadcast dari Rooms
    this.unsubs.push(rooms.on('pos', (data) => this.onRemotePos(data)));
    this.unsubs.push(rooms.on('bye', (data) => this.onRemoteBye(data)));
  }

  // Panggil dari Game.animate
  update(dt) {
    // Kirim posisi lokal (throttled)
    const now = performance.now();
    if (now - this.lastSend >= this.sendInterval) {
      this.lastSend = now;
      const pos = this.camera.position;
      const yaw = this.camera.rotation.y;
      this.rooms.sendPosition({
        clientId: this.localClientId,
        name: this.rooms.currentPlayer?.name || 'Player',
        x: +pos.x.toFixed(2),
        y: +pos.y.toFixed(2),
        z: +pos.z.toFixed(2),
        yaw: +yaw.toFixed(2)
      });
    }

    // Interpolasi posisi pemain lain + animasi
    let anyMoving = false;
    for (const [, p] of this.others) {
      if (!p.target) continue;
      const g = p.group;
      const dx = p.target.x - g.position.x;
      const dz = p.target.z - g.position.z;
      const dist = Math.hypot(dx, dz);
      const moving = dist > 0.05;

      if (moving) {
        const k = Math.min(1, dt * 10);
        g.position.x += dx * k;
        g.position.z += dz * k;
        anyMoving = true;
      }
      g.position.y = 0;
      // Rotasi halus ke target yaw
      const targetYaw = p.target.yaw ?? g.rotation.y;
      let dyaw = targetYaw - g.rotation.y;
      while (dyaw > Math.PI) dyaw -= Math.PI * 2;
      while (dyaw < -Math.PI) dyaw += Math.PI * 2;
      g.rotation.y += dyaw * Math.min(1, dt * 8);

      // Animasi kaki
      if (moving) {
        this.walkPhase += dt * 8;
        const swing = Math.sin(this.walkPhase) * 0.4;
        p.legL.rotation.x = swing;
        p.legR.rotation.x = -swing;
        p.armL.rotation.x = -swing * 0.7;
        p.armR.rotation.x = swing * 0.7;
      } else {
        p.legL.rotation.x *= 0.85;
        p.legR.rotation.x *= 0.85;
        p.armL.rotation.x *= 0.85;
        p.armR.rotation.x *= 0.85;
      }
    }
  }

  onRemotePos(data) {
    if (!data || !data.clientId) return;
    if (data.clientId === this.localClientId) return; // abaikan diri sendiri

    let p = this.others.get(data.clientId);
    if (!p) {
      // Buat karakter baru
      const color = colorFromId(data.clientId);
      const built = buildCharacter(data.name || 'Player', color);
      built.group.position.set(data.x || 0, 0, data.z || 0);
      this.scene.add(built.group);
      p = {
        ...built,
        target: { x: data.x || 0, z: data.z || 0, yaw: data.yaw || 0 },
        name: data.name || 'Player'
      };
      this.others.set(data.clientId, p);
      console.log('[PlayerSync] join:', data.clientId, data.name);
    } else {
      p.target = { x: data.x, z: data.z, yaw: data.yaw };
    }
  }

  onRemoteBye(data) {
    if (!data || !data.clientId) return;
    const p = this.others.get(data.clientId);
    if (p) {
      this.scene.remove(p.group);
      // Dispose geometri + material + sprite texture
      p.group.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (o.material.map) o.material.map.dispose();
          o.material.dispose();
        }
      });
      this.others.delete(data.clientId);
      console.log('[PlayerSync] leave:', data.clientId);
    }
  }

  destroy() {
    for (const u of this.unsubs) u();
    this.unsubs.length = 0;
    for (const [, p] of this.others) {
      this.scene.remove(p.group);
      p.group.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (o.material.map) o.material.map.dispose();
          o.material.dispose();
        }
      });
    }
    this.others.clear();
  }
}
