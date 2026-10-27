export class Minimap {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 150;
    this.canvas.height = 150;
    this.canvas.style.cssText = `
      position: fixed; top: 16px; left: 16px; z-index: 9999;
      background: rgba(10, 10, 20, 0.6); border: 2px solid #555;
      border-radius: 50%; pointer-events: none;
      box-shadow: 0 0 10px rgba(0,0,0,0.8);
    `;
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.scale = 0.15; 
  }

  update(playerPos, playerYaw) {
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

    ctx.fillStyle = '#2a4a2a';
    ctx.fillRect(0, 0, w, h);

    ctx.translate(cx, cy);
    ctx.rotate(-playerYaw);

    // Jalan
    ctx.fillStyle = '#444';
    ctx.fillRect(-10 * this.scale, -175 * this.scale, 20 * this.scale, 350 * this.scale);
    ctx.fillRect(-175 * this.scale, -10 * this.scale, 350 * this.scale, 20 * this.scale);

    // Pemain
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();

    // Arah
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(-6, 6);
    ctx.lineTo(6, 6);
    ctx.closePath();
    ctx.fillStyle = '#fff';
    ctx.fill();

    ctx.restore();

    ctx.beginPath();
    ctx.arc(cx, cy, cx - 2, 0, Math.PI * 2);
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 4;
    ctx.stroke();
  }
}
