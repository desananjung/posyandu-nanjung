import { ambilSemuaOffline, hapusOffline } from './offlineDB';
import { createKegiatan } from './api';

// ==========================================
// 1. Fungsi untuk mengirim semua data ke Supabase
// ==========================================
export const sinkronkanSemua = async () => {
  if (!navigator.onLine) return; // Jangan lakukan apa-apa jika offline
  
  try {
    const dataPending = await ambilSemuaOffline();
    if (dataPending.length === 0) return;

    console.log(`Menyinkronkan ${dataPending.length} data offline...`);

    for (const item of dataPending) {
      try {
        // Hapus id lokal sebelum dikirim ke Supabase
        const { id, ...payload } = item; 
        await createKegiatan(payload);
        await hapusOffline(id); // Hapus dari HP jika berhasil terkirim
      } catch (err) {
        console.error('Gagal sync satu data:', err);
        break; // Hentikan proses jika internet terputus lagi
      }
    }
  } catch (error) {
    console.error('Error saat sinkronisasi:', error);
  }
};

// ==========================================
// 2. Fungsi untuk menghitung berapa data yang tertahan
// ==========================================
export const hitungPending = async () => {
  try {
    const data = await ambilSemuaOffline();
    return data.length;
  } catch (error) {
    return 0;
  }
};

// ==========================================
// 3. Alias (Opsional) agar kompatibel dengan App.jsx
// ==========================================
export const syncDataOffline = sinkronkanSemua;