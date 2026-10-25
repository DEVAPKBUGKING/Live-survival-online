export class Collision {
  constructor() {
    this.boxes = []; 
  }

  addBox(minX, minY, minZ, maxX, maxY, maxZ) {
    this.boxes.push({ minX, minY, minZ, maxX, maxY, maxZ });
  }

  isBlocked(x, z, r) {
    const footY = 0.1;
    const headY = 1.8;
    for (const b of this.boxes) {
      // Abaikan kotak yang posisinya di luar jangkauan ketinggian pemain
      if (b.maxY < footY || b.minY > headY) continue;

      if (
        x + r > b.minX && x - r < b.maxX &&
        z + r > b.minZ && z - r < b.maxZ
      ) {
        return true;
      }
    }
    return false;
  }

  // Fungsi untuk reset collision jika diperlukan
  clear() {
    this.boxes = [];
  }
}
