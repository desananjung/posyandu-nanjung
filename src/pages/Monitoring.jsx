import { useState } from 'react';
import { useKegiatan } from '../hooks/useKegiatan';
import { AlertCircle, CheckCircle } from 'lucide-react';
import Toast from '../components/Toast';

export default function Monitoring() {
  const { kegiatan, loading, updateStatus } = useKegiatan();
  const [toast, setToast] = useState(null);

  // Filter kegiatan yang punya tindak lanjut dan belum selesai
  const pendingTindakLanjut = kegiatan.filter(k => 
    k.tindak_lanjut && k.tindak_lanjut.trim() !== '' && k.status !== 'final'
  );

  const handleSelesai = async (id) => {
    const { error } = await updateStatus(id, 'final');
    if (error) setToast({ msg: 'Gagal update status', type: 'error' });
    else setToast({ msg: 'Tindak lanjut diselesaikan', type: 'success' });
  };

  if (loading) return <div className="p-10 text-center">Memuat data...</div>;

  return (
    <div className="space-y-6 relative">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Monitoring Tindak Lanjut</h1>
        <p className="text-sm text-zinc-500 mt-1">Pantau kendala lapangan dan pastikan segera ditindaklanjuti.</p>
      </div>

      <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl flex gap-3">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <div className="text-sm">
          Terdapat <strong>{pendingTindakLanjut.length} kegiatan</strong> yang memiliki catatan tindak lanjut dan belum diselesaikan.
        </div>
      </div>

      <div className="grid gap-4">
        {pendingTindakLanjut.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 bg-white rounded-2xl border border-zinc-200">
            Tidak ada tindak lanjut yang tertunda. Kerja bagus! 🎉
          </div>
        ) : (
          pendingTindakLanjut.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-2xl border border-zinc-200 flex flex-col md:flex-row justify-between gap-4">
              <div>
                <div className="font-bold text-zinc-900">{item.nama_kegiatan}</div>
                <div className="text-xs text-zinc-500 mt-1 mb-3">{item.tanggal} · {item.rw}</div>
                <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 text-sm">
                  <div className="font-semibold text-xs text-zinc-500 mb-1">Tindak Lanjut:</div>
                  {item.tindak_lanjut}
                </div>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => handleSelesai(item.id)}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition"
                >
                  <CheckCircle className="w-4 h-4" /> Tandai Selesai
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}