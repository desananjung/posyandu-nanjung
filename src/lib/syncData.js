import { ambilSemuaOffline, hapusOffline } from './offlineDB';
import { createKegiatan } from './api';

export const syncDataOffline = async () => {
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
        // Jika gagal (misal internet putus lagi), hentikan proses loop
        break; 
      }
    }
  } catch (error) {
    console.error('Error saat sinkronisasi:', error);
  }
};