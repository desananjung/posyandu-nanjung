import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, Users, PlusCircle, Calendar, AlertCircle, Trash2, Edit, Printer 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useKegiatan } from '../hooks/useKegiatan';
import { deleteKegiatan } from '../lib/api';
import ModalEditKegiatan from '../components/ModalEditKegiatan';
import { BIDANG } from '../lib/data';
import Toast from '../components/Toast';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';

export default function DashboardKader() {
  const { user } = useAuth();
  const { kegiatan, loading, fetchKegiatan } = useKegiatan();
  
  const [selectedKegiatan, setSelectedKegiatan] = useState(null);
  const [toast, setToast] = useState(null);

  // Filter kegiatan hanya untuk RW kader ini
  const myKegiatan = useMemo(() => {
    return kegiatan.filter(k => k.rw === user?.rw);
  }, [kegiatan, user?.rw]);

  // Perhitungan statistik
  const stat = useMemo(() => {
    const total = myKegiatan.length;
    const sasaran = myKegiatan.reduce((a, k) => a + (Number(k.sasaran) || 0), 0);
    const draft = myKegiatan.filter(k => k.status === 'draft').length;
    return { total, sasaran, draft };
  }, [myKegiatan]);

  // Data grafik per bidang
  const chartData = useMemo(() => {
    return BIDANG.map(b => ({
      name: b.short,
      jumlah: myKegiatan.filter(k => k.bidang === b.id).length
    })).filter(d => d.jumlah > 0);
  }, [myKegiatan]);

  const hariIni = new Date().toLocaleDateString('id-ID', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  });

  const handleHapus = async (id) => {
    if (!window.confirm("Yakin ingin menghapus kegiatan ini secara permanen?")) return;
    try {
      await deleteKegiatan(id);
      setToast({ msg: 'Kegiatan berhasil dihapus', type: 'success' });
      fetchKegiatan();
    } catch (err) {
      setToast({ msg: 'Gagal menghapus: ' + err.message, type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        {/* Spinner Warna Pink */}
        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Banner Sambutan (Warna Pink) */}
      <div className="bg-[var(--primary)] rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute right-20 -bottom-10 w-32 h-32 bg-white/10 rounded-full" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white/80 text-sm mb-2 font-medium">
            <Calendar className="w-4 h-4" /> {hariIni}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Halo, {user?.nama}! 👋
          </h1>
          <p className="text-white/90 text-sm max-w-lg mb-6">
            Anda bertugas di wilayah <strong>{user?.rw || 'Desa Nanjung'}</strong>. 
            Pastikan seluruh kegiatan Posyandu bulan ini sudah diinput ke dalam sistem.
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Link 
              to="/input" 
              className="inline-flex items-center gap-2 bg-white text-[var(--primary)] px-5 py-2.5 rounded-full font-bold text-sm shadow-sm hover:bg-[var(--primary-light)] transition"
            >
              <PlusCircle className="w-4 h-4" /> Input Kegiatan Baru
            </Link>
            <Link 
              to="/laporan-kader" 
              className="inline-flex items-center gap-2 bg-[var(--primary-2)] border border-white/20 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-sm hover:bg-black/20 transition"
            >
              <Printer className="w-4 h-4" /> Cetak Laporan Posyandu
            </Link>
          </div>
        </div>
      </div>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] grid place-items-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[var(--primary)] bg-[var(--primary-light)] px-2 py-1 rounded-lg">
              RW Anda
            </span>
          </div>
          <div className="text-3xl font-bold text-[var(--text)]">{stat.total}</div>
          <div className="text-sm font-medium text-[var(--text-muted)] mt-1">Total Kegiatan Diinput</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] grid place-items-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[var(--text)]">{stat.sasaran}</div>
          <div className="text-sm font-medium text-[var(--text-muted)] mt-1">Total Sasaran Terlayani</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 grid place-items-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[var(--text)]">{stat.draft}</div>
          <div className="text-sm font-medium text-[var(--text-muted)] mt-1">Menunggu Verifikasi</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabel Riwayat Kegiatan */}
        <div className="lg:col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface-2)]">
            <h3 className="font-bold text-[var(--text)]">Riwayat Kegiatan Anda</h3>
            <span className="text-xs text-[var(--text-muted)]">{myKegiatan.length} Data</span>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {myKegiatan.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center">
                <ClipboardList className="w-12 h-12 text-[var(--text-muted)] mb-3 opacity-50" />
                <h4 className="font-bold text-[var(--text)] mb-1">Belum Ada Kegiatan</h4>
                <p className="text-sm text-[var(--text-muted)]">Anda belum menginput kegiatan apapun.</p>
              </div>
            ) : (
              myKegiatan.slice(0, 10).map((k) => {
                const b = BIDANG.find(x => x.id === k.bidang);
                return (
                  <div key={k.id} className="p-4 hover:bg-[var(--surface-2)] transition flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-10 h-10 rounded-xl grid place-items-center shrink-0" style={{ background: b?.light, color: b?.color }}>
                      {b && <b.icon className="w-5 h-5" />}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-[var(--text)] truncate">{k.nama_kegiatan}</div>
                      <div className="text-xs text-[var(--text-muted)] flex items-center gap-2 mt-0.5">
                        <span>{k.tanggal}</span>
                        <span>·</span>
                        <span>{k.sasaran} sasaran</span>
                        <span>·</span>
                        <span className={`font-bold ${k.status === 'draft' ? 'text-amber-600' : 'text-[var(--primary)]'}`}>
                          {k.status === 'draft' ? 'Draft' : 'Terverifikasi'}
                        </span>
                      </div>
                    </div>
                    
                    {/* TOMBOL AKSI (Edit & Hapus) */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => setSelectedKegiatan(k)} 
                        className="p-2 text-[var(--primary)] bg-[var(--primary-light)] rounded-lg hover:bg-[var(--primary)] hover:text-white transition"
                        title="Edit Kegiatan"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleHapus(k.id)} 
                        className="p-2 text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-600 hover:text-white transition"
                        title="Hapus Kegiatan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {myKegiatan.length > 0 && (
            <div className="p-3 text-center border-t border-[var(--border)] bg-[var(--surface-2)]">
              <Link to="/laporan" className="text-xs font-bold text-[var(--primary)] hover:underline">
                Lihat Semua Riwayat
              </Link>
            </div>
          )}
        </div>

        {/* Grafik Mini */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm flex flex-col">
          <h3 className="font-bold text-[var(--text)] mb-4">Sebaran Bidang SPM</h3>
          {chartData.length === 0 ? (
            <div className="flex-1 grid place-items-center text-sm text-[var(--text-muted)]">
              Belum ada data grafik
            </div>
          ) : (
            <div className="flex-1 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} width={80} />
                  <Tooltip cursor={{ fill: 'var(--surface-2)' }} contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }} />
                  {/* Grafik Warna Pink */}
                  <Bar dataKey="jumlah" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Modal Edit */}
      {selectedKegiatan && (
        <ModalEditKegiatan 
          kegiatan={selectedKegiatan} 
          onClose={() => setSelectedKegiatan(null)} 
          onRefresh={fetchKegiatan} 
        />
      )}
    </div>
  );
}