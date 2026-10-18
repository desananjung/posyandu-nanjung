import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList, Users, AlertTriangle, TrendingUp,
  FileBarChart, UserCog, Building2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import { BIDANG, RW_LIST, POSYANDU_LIST } from '../lib/data';
import { supabase } from '../lib/supabase';

export default function DashboardAdmin() {
  const [kegiatan, setKegiatan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('kegiatan')
      .select('*')
      .order('tanggal', { ascending: false });

    if (!error) setKegiatan(data || []);
    setLoading(false);
  };

  // Semua useMemo HARUS berada di atas sebelum `if (loading)`
  const stat = useMemo(() => {
    const total = kegiatan.length;
    const sasaran = kegiatan.reduce((a, k) => a + (Number(k.sasaran) || 0), 0);
    const belum = kegiatan.filter((k) => k.status === 'draft').length;
    const bidangAktif = new Set(kegiatan.map((k) => k.bidang)).size;
    return { total, sasaran, belum, bidangAktif };
  }, [kegiatan]);

  const perBidang = useMemo(
    () =>
      BIDANG.map((b) => ({
        name: b.short,
        jumlah: kegiatan.filter((k) => k.bidang === b.id).length,
        color: b.color
      })),
    [kegiatan]
  );

  const perRW = useMemo(
    () =>
      RW_LIST.map((rw) => ({
        rw,
        jumlah: kegiatan.filter((k) => k.rw === rw).length,
        sasaran: kegiatan.filter((k) => k.rw === rw).reduce((a, k) => a + (Number(k.sasaran) || 0), 0)
      })),
    [kegiatan]
  );

  const perPosyandu = useMemo(() => {
    return POSYANDU_LIST.map(pos => {
      const dataPos = kegiatan.filter(k => k.posyandu === pos.nama);
      return {
        id: pos.id,
        nama: pos.nama,
        rw: pos.rw,
        jumlahKegiatan: dataPos.length,
        totalSasaran: dataPos.reduce((a, k) => a + (Number(k.sasaran) || 0), 0)
      };
    });
  }, [kegiatan]);

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold">Dashboard Admin Desa</h1>
          <p className="text-sm text-zinc-500 mt-1">Ringkasan 13 RW & 14 Posyandu · 6 Bidang SPM</p>
        </div>
        <div className="flex gap-2">
          <Link to="/laporan" className="inline-flex items-center gap-1.5 text-xs bg-emerald-700 text-white px-4 py-2 rounded-full font-bold hover:bg-emerald-800 transition">
            <FileBarChart className="w-3.5 h-3.5" /> Buat Laporan
          </Link>
          <Link to="/users" className="inline-flex items-center gap-1.5 text-xs border border-zinc-200 bg-white px-4 py-2 rounded-full font-bold hover:bg-zinc-50 transition">
            <UserCog className="w-3.5 h-3.5" /> Kelola User
          </Link>
        </div>
      </div>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard icon={ClipboardList} title="Total Kegiatan" value={stat.total} sub="Seluruh Posyandu" accent="bg-emerald-50 text-emerald-700" />
        <StatCard icon={Users} title="Sasaran Terlayani" value={stat.sasaran.toLocaleString('id-ID')} sub="Orang/KK" accent="bg-blue-50 text-blue-700" />
        <StatCard icon={AlertTriangle} title="Belum Lengkap" value={stat.belum} sub="Draft Kegiatan" accent="bg-amber-50 text-amber-700" />
        <StatCard icon={TrendingUp} title="Bidang Aktif" value={`${stat.bidangAktif}/6`} sub="Bidang SPM" accent="bg-purple-50 text-purple-700" />
      </div>

      {/* Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-4">Kegiatan per Bidang SPM</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perBidang}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9EDE4" />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #E9EDE4' }} cursor={{ fill: '#F6F7F2' }} />
                <Bar dataKey="jumlah" fill="#1A5D1A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-4">Kegiatan per RW (13 RW)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perRW}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9EDE4" />
                <XAxis dataKey="rw" fontSize={10} tickLine={false} axisLine={false} interval={0} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #E9EDE4' }} cursor={{ fill: '#F6F7F2' }} />
                <Bar dataKey="jumlah" fill="#0E7490" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabel Rekap Posyandu */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-100 flex items-center gap-2 bg-zinc-50/50">
          <Building2 className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-sm text-zinc-900">Rekapitulasi 14 Posyandu</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 bg-zinc-50 uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Nama Posyandu</th>
                <th className="px-4 py-3 font-semibold">Wilayah RW</th>
                <th className="px-4 py-3 font-semibold text-center">Total Kegiatan</th>
                <th className="px-4 py-3 font-semibold text-center">Total Sasaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {perPosyandu.map((pos) => (
                <tr key={pos.id} className="hover:bg-zinc-50/50 transition">
                  <td className="px-4 py-3 font-medium text-zinc-900">{pos.nama}</td>
                  <td className="px-4 py-3 text-zinc-600">{pos.rw}</td>
                  <td className="px-4 py-3 text-center font-bold text-emerald-700">{pos.jumlahKegiatan}</td>
                  <td className="px-4 py-3 text-center font-bold text-blue-700">{pos.totalSasaran}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {stat.total === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-zinc-200 p-10 text-center bg-zinc-50/50">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="font-bold text-zinc-900">Belum ada kegiatan</h3>
          <p className="text-sm text-zinc-500 mt-1 mb-4">Mulai dengan menambahkan kegiatan pertama dari akun Kader.</p>
          <Link to="/input" className="inline-block bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-full text-sm font-bold transition shadow-sm">
            + Input Kegiatan Sekarang
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, title, value, sub, accent }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className={`w-9 h-9 rounded-xl grid place-items-center ${accent} mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-[11px] text-zinc-500 uppercase tracking-wide font-bold">{title}</div>
      <div className="text-2xl font-bold mt-1 text-zinc-900">{value}</div>
      <div className="text-xs text-zinc-500 mt-1">{sub}</div>
    </div>
  );
}