export const CityCucum = {
  name: 'Cucum',
  country: 'Forge',
  size: 400, 
  
  locations: [
    // --- PINGGIRAN & PERUMAHAN ---
    { name: 'Rumah (Pemain)', icon: '🏠', x: -130, z: 130 }, 
    { name: 'Supermarket', icon: '🛒', x: -100, z: 70 },
    { name: 'Taman', icon: '🌳', x: -70, z: 150 },

    // --- PUSAT KOTA (Dipindah ke pinggir jalan raya) ---
    { name: 'Balai Kota', icon: '🏛️', x: 40, z: 40 },       // Pindah ke Kanan Bawah
    { name: 'Polisi', icon: '👮', x: -40, z: -40 },         // Pindah ke Kiri Atas
    { name: 'Pusat Perbelanjaan', icon: '🛍️', x: -40, z: 40 }, // Kiri Bawah
    { name: 'Restoran/Kafe', icon: '🍽️', x: 60, z: -20 },   // Kanan Atas
    { name: 'Rumah Sakit', icon: '🏥', x: 70, z: -80 },
    { name: 'Hotel', icon: '🏨', x: -60, z: -90 },
    
    // --- AREA KOMERSIAL & HIBURAN ---
    { name: 'Game Center', icon: '🎮', x: 100, z: 80 },
    { name: 'Tempat Kerja/Industri', icon: '🏭', x: -130, z: -80 },
    { name: 'Terminal (Bus/Kereta)', icon: '🚌', x: 120, z: -30 },

    // --- AREA LAUT & BANDARA ---
    { name: 'Dermaga', icon: '🚢', x: 150, z: 150 },   
    { name: 'Pelabuhan', icon: '⚓', x: 170, z: -150 }, 
    { name: 'Bandara', icon: '✈️', x: -100, z: -150 }   
  ]
};
