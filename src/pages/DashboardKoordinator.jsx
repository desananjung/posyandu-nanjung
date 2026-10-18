import { useMemo, useState } from 'react';
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useKegiatan } from '../hooks/useKegiatan';
import Toast from '../components/Toast';

export default function DashboardKoordinator() {
  const { kegiatan, loading, updateStatus } = useKegiatan();
  const [toast, setToast] = useState(null);

  const draftKegiatan = useMemo(() => {
    return kegiatan.filter(k => k.status === 'draft');
  }, [kegiatan]);

  const handleVerify = async (id) => {
    const { error } = await updateStatus(id, 'diperiksa');
    if (error) {
      setToast({ msg: 'Gagal memverifikasi', type: 'error' });
    } else {
      setToast({ msg: 'Kegiatan berhasil diverifikasi', type: 'success' });
    }
  };

  if (loading) return <div className="p-10 text-center">Memuat data...</div>;

  return (
    <div className="space-y-6 relative">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard Koordinator</h1>
        <p className="text-sm text-zinc-500 mt-1">Pantau dan verifikasi kegiatan dari para Kader.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-amber-800 font-bold mb-2">
            <Clock className="w-5 h-5" /> Menunggu Verifikasi
          </div>
          <div className="text-3xl font-bold text-amber-900">{draftKegiatan.length}</div>
          <div className="text-xs text-amber-700 mt-1">Laporan berstatus draft</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-emerald-800 font-bold mb-2">
            <CheckCircle2 className="w-5 h-5" /> Terverifikasi
          </div>
          <div className="text-3xl font-bold text-emerald-900">
            {kegiatan.filter(k => k.status !== 'draft').length}
          </div>
          <div className="text-xs text-emerald-700 mt-1">Kegiatan sudah diperiksa</div>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex items-center gap-2 bg-zinc-50">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-zinc-900">Antrian Verifikasi</h3>
        </div>
        <div className="divide-y divide-zinc-100">
          {draftKegiatan.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">Semua kegiatan sudah diverifikasi! 🎉</div>
          ) : (
            draftKegiatan.map((k) => (
              <div key={k.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-zinc-50">
                <div>
                  <div className="font-bold text-sm text-zinc-900">{k.nama_kegiatan}</div>
                  <div className="text-xs text-zinc-500 mt-1">
                    {k.tanggal} · {k.rw} · Kader: {k.profiles?.nama || 'Unknown'}
                  </div>
                </div>
                <button
                  onClick={() => handleVerify(k.id)}
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition"
                >
                  <CheckCircle2 className="w-4 h-4" /> Verifikasi Sekarang
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}