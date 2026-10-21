import { useState, useMemo } from 'react';
import { useKegiatan } from '../hooks/useKegiatan';
import { FileSpreadsheet, Printer } from 'lucide-react';
// Gabungkan semua import dari data.js ke dalam satu baris
import { BIDANG, SIKLUS_HIDUP_LIST } from '../lib/data';
import { exportToCSV, formatTanggal } from '../lib/api';
import Toast from '../components/Toast';

export default function Laporan() {
  const { kegiatan, loading } = useKegiatan();
  const [bulan, setBulan] = useState('');
  const [toast, setToast] = useState(null);

  const filteredData = useMemo(() => {
    if (!bulan) return kegiatan;
    return kegiatan.filter(k => k.tanggal.startsWith(bulan));
  }, [kegiatan, bulan]);

  const totalSasaran = filteredData.reduce((a, k) => a + (Number(k.sasaran) || 0), 0);

  const rekapBidang = useMemo(() => {
    const map = {};
    filteredData.forEach(k => {
      if (!map[k.bidang]) map[k.bidang] = { kegiatan: 0, sasaran: 0 };
      map[k.bidang].kegiatan += 1;
      map[k.bidang].sasaran += Number(k.sasaran) || 0;
    });
    return map;
  }, [filteredData]);

    // Rekap per Siklus Hidup (ILP)
  const rekapILP = useMemo(() => {
    const map = {};
    SIKLUS_HIDUP_LIST.forEach(siklus => {
      map[siklus] = { kegiatan: 0, sasaran: 0 };
    });

    filteredData.forEach(k => {
      const siklus = k.siklus_hidup || 'Lainnya';
      if (!map[siklus]) map[siklus] = { kegiatan: 0, sasaran: 0 };
      map[siklus].kegiatan += 1;
      map[siklus].sasaran += Number(k.sasaran) || 0;
    });

    return map;
  }, [filteredData]);

  // --- FUNGSI EKSPOR CSV ---
  const handleExportCSV = () => {
    if (filteredData.length === 0) return setToast({ msg: 'Tidak ada data untuk diekspor', type: 'error' });
    
    // Siapkan data untuk CSV
    const dataToExport = filteredData.map(k => ({
      Tanggal: k.tanggal,
      RW: k.rw,
      Bidang: BIDANG.find(b => b.id === k.bidang)?.name || k.bidang,
      'Sub Kegiatan': k.sub_bidang,
      Kegiatan: k.nama_kegiatan,
      Sasaran: k.sasaran,
      Hasil: k.hasil,
      Status: k.status
    }));

    exportToCSV(dataToExport, `Laporan_Posyandu_${bulan || 'Semua'}.csv`);
    setToast({ msg: 'File Excel/CSV berhasil diunduh', type: 'success' });
  };

  // --- FUNGSI CETAK (Print Browser) ---
  const handleCetak = () => {
    window.print();
  };

  if (loading) return <div className="p-10 text-center">Memuat data...</div>;

  return (
    <div className="space-y-6 relative">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Laporan Posyandu</h1>
          <p className="text-sm text-zinc-500">Rekap kegiatan dan sasaran siap cetak.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCetak} className="inline-flex items-center gap-2 bg-zinc-800 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-zinc-900 shadow-sm transition">
            <Printer className="w-4 h-4" /> Cetak PDF
          </button>
          <button onClick={handleExportCSV} className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-sm transition">
            <FileSpreadsheet className="w-4 h-4" /> Ekspor Excel
          </button>
        </div>
      </div>

      {/* Form Filter (Disembunyikan saat print) */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 print:hidden">
        <label className="text-xs font-semibold mb-2 block">Pilih Bulan Laporan</label>
        <input 
          type="month" 
          value={bulan}
          onChange={(e) => setBulan(e.target.value)}
          className="rounded-xl border border-zinc-200 px-4 py-2 text-sm bg-zinc-50 focus:ring-2 focus:ring-emerald-500" 
        />
      </div>

      {/* Konten Laporan (Akan Tercetak) */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 print:border-0 print:shadow-none">
        
        {/* Kop Surat (Hanya muncul saat print) */}
        <div className="hidden print:block text-center mb-6 border-b-2 border-black pb-4">
          <img src="/logo-desa.png" alt="Logo Desa" className="w-20 h-20 object-contain mb-2" />
          <h2 className="text-xl font-bold uppercase">Pemerintah Kabupaten Bandung</h2>
          <h3 className="text-lg font-bold">Kecamatan Margaasih - Desa Nanjung</h3>
          <p className="text-sm mt-1">Laporan Kegiatan Posyandu 6 SPM</p>
          <p className="text-sm">Periode: {bulan ? new Date(bulan).toLocaleDateString('id-ID', {month: 'long', year: 'numeric'}) : 'Semua Periode'}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="border border-zinc-200 p-4 rounded-xl print:border-zinc-400">
            <div className="text-xs text-zinc-500 font-medium">Total Kegiatan</div>
            <div className="text-2xl font-bold text-zinc-900">{filteredData.length}</div>
          </div>
          <div className="border border-zinc-200 p-4 rounded-xl print:border-zinc-400">
            <div className="text-xs text-zinc-500 font-medium">Total Sasaran</div>
            <div className="text-2xl font-bold text-zinc-900">{totalSasaran}</div>
          </div>
        </div>

        <h3 className="font-bold text-lg mb-3">Rekapitulasi per Bidang</h3>
        <table className="w-full text-sm text-left border-collapse mb-6">
          <thead>
            <tr className="bg-zinc-50 print:bg-transparent">
              <th className="px-4 py-2 border border-zinc-200 print:border-zinc-400">Bidang SPM</th>
              <th className="px-4 py-2 border border-zinc-200 print:border-zinc-400 text-center">Jml Kegiatan</th>
              <th className="px-4 py-2 border border-zinc-200 print:border-zinc-400 text-center">Jml Sasaran</th>
            </tr>
          </thead>
          <tbody>
            {BIDANG.map(b => {
              const data = rekapBidang[b.id] || { kegiatan: 0, sasaran: 0 };
              return (
                <tr key={b.id}>
                  <td className="px-4 py-2 border border-zinc-200 print:border-zinc-400 font-medium">{b.name}</td>
                  <td className="px-4 py-2 border border-zinc-200 print:border-zinc-400 text-center">{data.kegiatan}</td>
                  <td className="px-4 py-2 border border-zinc-200 print:border-zinc-400 text-center">{data.sasaran}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

                {/* Tabel Rekap Siklus Hidup (ILP) */}
        <h3 className="font-bold text-lg mb-3 mt-6">Rekapitulasi Siklus Hidup (ILP)</h3>
        <table className="w-full text-sm text-left border-collapse mb-6">
          <thead>
            <tr className="bg-zinc-50 print:bg-transparent">
              <th className="px-4 py-2 border border-zinc-200 print:border-zinc-400">Siklus Hidup</th>
              <th className="px-4 py-2 border border-zinc-200 print:border-zinc-400 text-center">Jml Kegiatan</th>
              <th className="px-4 py-2 border border-zinc-200 print:border-zinc-400 text-center">Jml Sasaran</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(rekapILP).map(([siklus, data]) => (
              <tr key={siklus}>
                <td className="px-4 py-2 border border-zinc-200 print:border-zinc-400 font-medium">{siklus}</td>
                <td className="px-4 py-2 border border-zinc-200 print:border-zinc-400 text-center">{data.kegiatan}</td>
                <td className="px-4 py-2 border border-zinc-200 print:border-zinc-400 text-center">{data.sasaran}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Tanda Tangan (Hanya muncul saat print) */}
        <div className="hidden print:flex justify-between mt-12">
          <div className="text-center">
            <p>Mengetahui,</p>
            <p>Kepala Desa Nanjung</p>
            <div className="h-16"></div>
            <p className="font-bold underline">Dian Irawan.SE</p>
          </div>
          <div className="text-center">
            <p>Nanjung, {new Date().toLocaleDateString('id-ID')}</p>
            <p>Admin Posyandu</p>
            <div className="h-16"></div>
            <p className="font-bold underline">Admin Desa</p>
          </div>
        </div>

      </div>
    </div>
  );
}