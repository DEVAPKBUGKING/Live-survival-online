export const NPCGeco = {
  id: 'geco',
  name: 'Geco',
  color: 0x6ee7b7, // Warna hijau kebiruan
  position: { x: 0, z: -8 }, // Posisi di depan rumah
  radius: 3, // Jarak maksimal biar bisa diajak ngobrol
  dialog: [
    { text: 'Halo pemain baru! Selamat datang di Kota Cucum, Forge. Aku Geco, pemandu mu.' },
    { text: 'Kamu sekarang ada di Main House. Untuk jalan-jalan, gunakan joystick atau WASD.' },
    { text: 'Di kota ini kamu butuh Lisensi (KTP) untuk masuk gedung. Ini aku kasih gratisan buat kamu.' },
    { text: 'Nih, KTP kamu udah aktif. Coba cek pojok kanan atas, uangmu juga udah ada $5000.' }
  ],
  onDialogEnd: (uiManager) => {
    // Aksi ketika dialog terakhir selesai
    uiManager.giveLicense();
    uiManager.addMoney(5000);
  }
};
