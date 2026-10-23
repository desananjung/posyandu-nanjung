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
        {/* Loading Spinner warna Pink */}
        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[var(--text)]">Dashboard Admin Desa</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Ringkasan 13 RW & 14 Posyandu · 6 Bidang SPM</p>
        </div>
        <div className="flex gap-2">
          {/* Tombol Laporan (Pink) */}
          <Link to="/laporan" className="inline-flex items-center gap-1.5 text-xs bg-[var(--primary)] text-white px-4 py-2 rounded-full font-bold hover:bg-[var(--primary-2)] transition shadow-sm">
            <FileBarChart className="w-3.5 h-3.5" /> Buat Laporan
          </Link>
          {/* Tombol Kelola User (Putih Border) */}
          <Link to="/users" className="inline-flex items-center gap-1.5 text-xs border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] px-4 py-2 rounded-full font-bold hover:bg-[var(--surface-2)] transition">
            <UserCog className="w-3.5 h-3.5" /> Kelola User
          </Link>
        </div>
      </div>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard icon={ClipboardList} title="Total Kegiatan" value={stat.total} sub="Seluruh Posyandu" accent="bg-[var(--primary-light)] text-[var(--primary)]" />
        <StatCard icon={Users} title="Sasaran Terlayani" value={stat.sasaran.toLocaleString('id-ID')} sub="Orang/KK" accent="bg-blue-50 text-blue-700" />
        <StatCard icon={AlertTriangle} title="Belum Lengkap" value={stat.belum} sub="Draft Kegiatan" accent="bg-amber-50 text-amber-700" />
        <StatCard icon={TrendingUp} title="Bidang Aktif" value={`${stat.bidangAktif}/6`} sub="Bidang SPM" accent="bg-[var(--accent-light)] text-[var(--accent)]" />
      </div>

      {/* Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-4 text-[var(--text)]">Kegiatan per Bidang SPM</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perBidang}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: 'var(--text-muted)' }} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} tick={{ fill: 'var(--text-muted)' }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }} cursor={{ fill: 'var(--surface-2)' }} />
                {/* Grafik Batang Warna Pink */}
                <Bar dataKey="jumlah" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-4 text-[var(--text)]">Kegiatan per RW (13 RW)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perRW}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="rw" fontSize={10} tickLine={false} axisLine={false} interval={0} tick={{ fill: 'var(--text-muted)' }} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} tick={{ fill: 'var(--text-muted)' }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }} cursor={{ fill: 'var(--surface-2)' }} />
                {/* Grafik Batang Warna Ungu */}
                <Bar dataKey="jumlah" fill="var(--accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabel Rekap Posyandu */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[var(--border)] flex items-center gap-2 bg-[var(--surface-2)]">
          <Building2 className="w-4 h-4 text-[var(--primary)]" />
          <h3 className="font-bold text-sm text-[var(--text)]">Rekapitulasi 14 Posyandu</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[var(--text-muted)] bg-[var(--surface-2)] uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Nama Posyandu</th>
                <th className="px-4 py-3 font-semibold">Wilayah RW</th>
                <th className="px-4 py-3 font-semibold text-center">Total Kegiatan</th>
                <th className="px-4 py-3 font-semibold text-center">Total Sasaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {perPosyandu.map((pos) => (
                <tr key={pos.id} className="hover:bg-[var(--surface-2)]/50 transition">
                  <td className="px-4 py-3 font-medium text-[var(--text)]">{pos.nama}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{pos.rw}</td>
                  <td className="px-4 py-3 text-center font-bold text-[var(--primary)]">{pos.jumlahKegiatan}</td>
                  <td className="px-4 py-3 text-center font-bold text-[var(--accent)]">{pos.totalSasaran}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {stat.total === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-[var(--border)] p-10 text-center bg-[var(--surface-2)]/50">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="font-bold text-[var(--text)]">Belum ada kegiatan</h3>
          <p className="text-sm text-[var(--text-muted)] mt-1 mb-4">Mulai dengan menambahkan kegiatan pertama dari akun Kader.</p>
          <Link to="/input" className="inline-block bg-[var(--primary)] hover:bg-[var(--primary-2)] text-white px-6 py-2.5 rounded-full text-sm font-bold transition shadow-sm">
            + Input Kegiatan Sekarang
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, title, value, sub, accent }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <div className={`w-9 h-9 rounded-xl grid place-items-center ${accent} mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide font-bold">{title}</div>
      <div className="text-2xl font-bold mt-1 text-[var(--text)]">{value}</div>
      <div className="text-xs text-[var(--text-muted)] mt-1">{sub}</div>
    </div>
  );
}