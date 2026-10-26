export const CityCucum = {
  name: 'Cucum',
  country: 'Forge',
  size: 400, // Pulau diperluas jadi 400x400
  
  locations: [
    // --- PINGGIRAN & PERUMAHAN ---
    { name: 'Rumah (Pemain)', icon: '🏠', x: -130, z: 130 }, 
    { name: 'Supermarket', icon: '🛒', x: -100, z: 70 },
    { name: 'Taman', icon: '🌳', x: -70, z: 150 },

    // --- PUSAT KOTA ---
    { name: 'Balai Kota', icon: '🏛️', x: 0, z: 0 },
    { name: 'Polisi', icon: '👮', x: 30, z: -30 },
    { name: 'Pusat Perbelanjaan', icon: '🛍️', x: -30, z: -30 },
    { name: 'Restoran/Kafe', icon: '🍽️', x: 40, z: 40 },
    { name: 'Rumah Sakit', icon: '🏥', x: 50, z: -70 },
    { name: 'Hotel', icon: '🏨', x: -50, z: -80 },
    
    // --- AREA KOMERSIAL & HIBURAN ---
    { name: 'Game Center', icon: '🎮', x: 100, z: 80 },
    { name: 'Tempat Kerja/Industri', icon: '🏭', x: -130, z: -80 },
    { name: 'Terminal (Bus/Kereta)', icon: '🚌', x: 120, z: -30 },

    // --- AREA LAUT & BANDARA (POSISI BARU YANG LOGIS) ---
    { name: 'Dermaga', icon: '🚢', x: 150, z: 150 },   // Di batas pantai kanan bawah
    { name: 'Pelabuhan', icon: '⚓', x: 170, z: -150 }, // Di batas pantai kanan atas
    { name: 'Bandara', icon: '✈️', x: -100, z: -150 }   // Pojok kiri atas, khusus bandara
  ]
};
