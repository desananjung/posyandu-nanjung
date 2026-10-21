import { useState, useEffect } from 'react';
import { WifiOff, Loader2, CheckCircle2 } from 'lucide-react';
import { hitungPending, sinkronkanSemua } from '../lib/syncData'; // Sesuaikan path

export default function SyncStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fungsi untuk mengecek berapa data yang tertahan di HP
  const checkPending = async () => {
    const jumlah = await hitungPending();
    setPendingCount(jumlah);
    return jumlah;
  };

  // Fungsi untuk memicu sinkronisasi
  const doSync = async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    try {
      await sinkronkanSemua();
      await checkPending();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    checkPending();

    const handleOnline = () => {
      setIsOnline(true);
      doSync(); // Otomatis sync saat online
    };
    const handleOffline = () => {
      setIsOnline(false);
      checkPending();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cek antrian setiap 5 detik (jika sedang online dan belum tersinkron)
    const interval = setInterval(() => {
      if (navigator.onLine) checkPending();
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Sembunyikan jika sedang online, tidak ada pending, dan tidak sedang sinkronisasi
  if (isOnline && pendingCount === 0 && !isSyncing && !showSuccess) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-fade-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-bold ${
        !isOnline 
          ? 'bg-amber-50 border-amber-200 text-amber-800'
          : isSyncing 
            ? 'bg-blue-50 border-blue-200 text-blue-800'
            : showSuccess
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
      }`}>
        
        {/* Ikon sesuai status */}
        {!isOnline && <WifiOff className="w-5 h-5" />}
        {isSyncing && <Loader2 className="w-5 h-5 animate-spin" />}
        {showSuccess && <CheckCircle2 className="w-5 h-5" />}
        {isOnline && pendingCount > 0 && !isSyncing && !showSuccess && <Loader2 className="w-5 h-5" />}

        {/* Teks sesuai status */}
        <div>
          {!isOnline && (
            <>
              <div>Mode Offline</div>
              {pendingCount > 0 && <div className="text-[11px] font-normal">{pendingCount} data tersimpan di HP</div>}
            </>
          )}
          {isOnline && isSyncing && (
            <div>Menyinkronkan data...</div>
          )}
          {isOnline && showSuccess && (
            <div>Semua data tersimpan!</div>
          )}
          {isOnline && pendingCount > 0 && !isSyncing && !showSuccess && (
            <>
              <div className="flex items-center gap-2">
                Menunggu Sinkronisasi
                <button onClick={doSync} className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded text-[10px] hover:bg-amber-300 transition">
                  Kirim Sekarang
                </button>
              </div>
              <div className="text-[11px] font-normal">{pendingCount} data di HP</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}