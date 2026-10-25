export class Minimap {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 150;
    this.canvas.height = 150;
    
    // PAKSA TAMPIL DI ATAS SEGALANYA
    this.canvas.style.cssText = `
      position: fixed; top: 16px; left: 16px; z-index: 99999;
      background: rgba(10, 10, 20, 0.6); border: 2px solid #555;
      border-radius: 50%; pointer-events: none;
      box-shadow: 0 0 10px rgba(0,0,0,0.8);
    `;
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    this.scale = 0.5;
  }

  update(playerPos, playerYaw, interactables) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    
    ctx.beginPath();
    ctx.arc(cx, cy, cx, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = '#2a4a2a'; // Warna tanah
    ctx.fillRect(0, 0, w, h);

    ctx.translate(cx, cy);
    ctx.rotate(-playerYaw);

    // Jalan
    ctx.fillStyle = '#444';
    ctx.fillRect(-6 * this.scale, -50 * this.scale, 12 * this.scale, 150 * this.scale);

    // Titik-titik (Bandara, Stasiun, dll)
    if (interactables) {
      for (const obj of interactables) {
        const dx = (obj.position.x - playerPos.x) * this.scale;
        const dz = (obj.position.z - playerPos.z) * this.scale;
        
        ctx.beginPath();
        ctx.arc(dx, dz, 5, 0, Math.PI * 2);
        
        if (obj.type === 'airport') ctx.fillStyle = '#3b82f6';
        else if (obj.type === 'subway') ctx.fillStyle = '#ef4444';
        else ctx.fillStyle = '#6ee7b7';
        ctx.fill();
      }
    }

    // Titik pemain
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();

    // Segitiga arah pandang
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(-6, 6);
    ctx.lineTo(6, 6);
    ctx.closePath();
    ctx.fillStyle = '#fff';
    ctx.fill();

    ctx.restore();

    // Border luar
    ctx.beginPath();
    ctx.arc(cx, cy, cx - 2, 0, Math.PI * 2);
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 4;
    ctx.stroke();
  }
}
