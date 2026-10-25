export const CityCucum = {
  name: 'Cucum',
  country: 'Forge',
  spawnPoint: { x: 0, z: 0 },
  
  // Bangunan utama
  airport: { x: 0, z: -150 },
  subway: { x: 0, z: 50 },
  
  // Perumahan
  residential: [
    { x: -20, z: 20, width: 10, depth: 10, color: 0x8a6a4a },
    { x: 20, z: 20, width: 10, depth: 10, color: 0x8a6a4a },
    { x: -20, z: 40, width: 10, depth: 10, color: 0x6a8a6a },
    { x: 20, z: 40, width: 10, depth: 10, color: 0x6a8a6a }
  ],
  
  // Pusat Kota (Gedung Tinggi)
  downtown: [
    { x: -25, z: -30, width: 15, depth: 15, height: 40, color: 0x8a8a8a },
    { x: 25, z: -30, width: 15, depth: 15, height: 50, color: 0x6a7a8a },
    { x: -25, z: -70, width: 15, depth: 15, height: 60, color: 0x7a6a6a },
    { x: 25, z: -70, width: 15, depth: 15, height: 35, color: 0x9a9a8a }
  ],
  
  // Tempat umum
  mall: { x: -25, z: -110, width: 30, depth: 20, height: 15, color: 0xd0d0d0 }
};
