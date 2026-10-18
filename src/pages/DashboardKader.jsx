import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, Users, PlusCircle, CheckCircle2, 
  Calendar, AlertCircle, MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useKegiatan } from '../hooks/useKegiatan';
import { BIDANG } from '../lib/data';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';

export default function DashboardKader() {
  const { user } = useAuth();
  const { kegiatan, loading } = useKegiatan();

  // Filter kegiatan hanya untuk RW kader ini
  const myKegiatan = useMemo(() => {
    return kegiatan.filter(k => k.rw === user.rw);
  }, [kegiatan, user.rw]);

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
    })).filter(d => d.jumlah > 0); // Hanya tampilkan yang ada datanya
  }, [myKegiatan]);

  const hariIni = new Date().toLocaleDateString('id-ID', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  });

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner Sambutan */}
      <div className="bg-emerald-700 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute right-20 -bottom-10 w-32 h-32 bg-emerald-500/20 rounded-full" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-emerald-200 text-sm mb-2 font-medium">
            <Calendar className="w-4 h-4" /> {hariIni}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Halo, {user?.nama}! 👋
          </h1>
          <p className="text-emerald-100 text-sm max-w-lg mb-6">
            Anda bertugas di wilayah <strong>{user?.rw || 'Desa Nanjung'}</strong>. 
            Pastikan seluruh kegiatan Posyandu bulan ini sudah diinput ke dalam sistem.
          </p>
          <Link 
            to="/input" 
            className="inline-flex items-center gap-2 bg-white text-emerald-800 px-5 py-2.5 rounded-full font-bold text-sm shadow-sm hover:bg-emerald-50 transition"
          >
            <PlusCircle className="w-4 h-4" /> Input Kegiatan Baru
          </Link>
        </div>
      </div>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
              RW Anda
            </span>
          </div>
          <div className="text-3xl font-bold text-zinc-900">{stat.total}</div>
          <div className="text-sm font-medium text-zinc-500 mt-1">Total Kegiatan Diinput</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 grid place-items-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-zinc-900">{stat.sasaran}</div>
          <div className="text-sm font-medium text-zinc-500 mt-1">Total Sasaran Terlayani</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 grid place-items-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-zinc-900">{stat.draft}</div>
          <div className="text-sm font-medium text-zinc-500 mt-1">Menunggu Verifikasi</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabel Riwayat Kegiatan */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
            <h3 className="font-bold text-zinc-900">Riwayat Kegiatan Anda</h3>
            <span className="text-xs text-zinc-500">{myKegiatan.length} Data</span>
          </div>
          <div className="divide-y divide-zinc-100">
            {myKegiatan.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center">
                <ClipboardList className="w-12 h-12 text-zinc-300 mb-3" />
                <h4 className="font-bold text-zinc-900 mb-1">Belum Ada Kegiatan</h4>
                <p className="text-sm text-zinc-500">Anda belum menginput kegiatan apapun.</p>
              </div>
            ) : (
              myKegiatan.slice(0, 5).map((k) => {
                const b = BIDANG.find(x => x.id === k.bidang);
                return (
                  <div key={k.id} className="p-4 hover:bg-zinc-50 transition flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl grid place-items-center shrink-0" style={{ background: b?.light, color: b?.color }}>
                      {b && <b.icon className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-zinc-900 truncate">{k.nama_kegiatan}</div>
                      <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                        <span>{k.tanggal}</span>
                        <span>·</span>
                        <span>{k.sasaran} sasaran</span>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold shrink-0 ${
                      k.status === 'draft' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {k.status === 'draft' ? 'Draft' : 'Terverifikasi'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          {myKegiatan.length > 0 && (
            <div className="p-3 text-center border-t border-zinc-100 bg-zinc-50">
              <Link to="/laporan" className="text-xs font-bold text-emerald-600 hover:underline">
                Lihat Semua Riwayat
              </Link>
            </div>
          )}
        </div>

        {/* Grafik Mini */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm flex flex-col">
          <h3 className="font-bold text-zinc-900 mb-4">Sebaran Bidang SPM</h3>
          {chartData.length === 0 ? (
            <div className="flex-1 grid place-items-center text-sm text-zinc-400">
              Belum ada data grafik
            </div>
          ) : (
            <div className="flex-1 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E9EDE4" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7D6B' }} width={80} />
                  <Tooltip cursor={{ fill: '#F6F7F2' }} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="jumlah" fill="#1A5D1A" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}