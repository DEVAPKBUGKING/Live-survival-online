export class Minimap {
  constructor(container) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 150;
    this.canvas.height = 150;
    // Style mirip radar GTA
    this.canvas.style.cssText = `
      position: fixed; top: 16px; left: 16px; z-index: 9000;
      background: rgba(10, 10, 20, 0.6); border: 2px solid #555;
      border-radius: 50%; pointer-events: none;
      box-shadow: 0 0 10px rgba(0,0,0,0.8);
    `;
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    // Skala peta (1 meter dunia = 0.5 pixel di minimap)
    this.scale = 0.5;
  }

  update(playerPos, playerYaw, interactables) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // Bersihkan canvas
    ctx.clearRect(0, 0, w, h);

    // Simpan state
    ctx.save();
    
    // Potong jadi lingkaran
    ctx.beginPath();
    ctx.arc(cx, cy, cx, 0, Math.PI * 2);
    ctx.clip();

    // Background tanah
    ctx.fillStyle = '#2a4a2a'; // Hijau gelap
    ctx.fillRect(0, 0, w, h);

    // Geser titik tengah canvas ke posisi pemain
    ctx.translate(cx, cy);
    
    // Rotasi peta berdasarkan arah hadap pemain (Yaw)
    // Kamera Three.js: 0 = lurus ke depan (-Z). 
    // Di Canvas 2D: 0 = kanan (+X). Maka kita rotasi -90 derajat (-Math.PI/2)
    ctx.rotate(-playerYaw);

    // Gambar Jalan Utama (Membentang dari Z -100 sampai Z 50)
    ctx.fillStyle = '#444';
    // Posisi X=0, Z dari -100 sampai 50, lebar 12
    ctx.fillRect(-6 * this.scale, -50 * this.scale, 12 * this.scale, 150 * this.scale);

    // Gambar Titik Interaksi (Bandara, Stasiun)
    for (const obj of interactables) {
      // Hitung posisi relatif ke pemain
      const dx = (obj.position.x - playerPos.x) * this.scale;
      const dz = (obj.position.z - playerPos.z) * this.scale;
      
      // Karena rotasi, Y di canvas adalah Z di dunia
      ctx.beginPath();
      ctx.arc(dx, dz, 5, 0, Math.PI * 2);
      
      if (obj.type === 'airport') {
        ctx.fillStyle = '#3b82f6'; // Biru untuk Bandara
      } else if (obj.type === 'subway') {
        ctx.fillStyle = '#ef4444'; // Merah untuk Stasiun
      } else {
        ctx.fillStyle = '#6ee7b7'; // Hijau untuk rumah
      }
      ctx.fill();
    }

    // Gambar pemain (Titik kuning di tengah)
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();

    // Gambar arah pandang pemain (Segitiga)
    ctx.beginPath();
    ctx.moveTo(0, -10); // Ujung depan
    ctx.lineTo(-6, 6);  // Kiri belakang
    ctx.lineTo(6, 6);   // Kanan belakang
    ctx.closePath();
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Kembalikan state
    ctx.restore();

    // Gambar border lingkaran luar
    ctx.beginPath();
    ctx.arc(cx, cy, cx - 2, 0, Math.PI * 2);
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 4;
    ctx.stroke();
  }
}
