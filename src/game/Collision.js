export class Collision {
  constructor() {
    this.boxes = []; // { minX, minY, minZ, maxX, maxY, maxZ }
  }

  addBox(minX, minY, minZ, maxX, maxY, maxZ) {
    this.boxes.push({ minX, minY, minZ, maxX, maxY, maxZ });
  }

  clear() {
    this.boxes.length = 0;
  }

  // Cek apakah posisi (x,z) dengan radius r bertabrakan dengan AABB mana pun.
  // Cek hanya di ketinggian pemain (0..2m) supaya lantai tidak menghalangi.
  isBlocked(x, z, r) {
    const footY = 0.1;
    const headY = 1.8;
    for (const b of this.boxes) {
      // skip kalau AABB sepenuhnya di luar rentang ketinggian pemain
      if (b.maxY < footY || b.minY > headY) continue;

      // AABB diperluas dengan radius pemain (inflate)
      if (
        x + r > b.minX && x - r < b.maxX &&
        z + r > b.minZ && z - r < b.maxZ
      ) {
        return true;
      }
    }
    return false;
  }
}
