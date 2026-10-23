import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Printer, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LaporanLiterasi() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    const fetchData = async () => {
      const { data: res } = await supabase
        .from('modul_literasi')
        .select('*, profiles:created_by (nama)')
        .order('tanggal', { ascending: false });
      if (res) setData(res);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(k => k.tanggal.startsWith(bulan));
  }, [data, bulan]);

  const handleCetak = () => window.print();

  if (loading) return <div className="p-10 text-center">Memuat data...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="print:hidden flex items-center justify-between">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>
        <button onClick={handleCetak} className="inline-flex items-center gap-2 bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm">
          <Printer className="w-4 h-4" /> Cetak Laporan (PDF)
        </button>
      </div>

      <div className="print:hidden bg-white p-4 rounded-2xl border border-zinc-200">
        <label className="text-xs font-bold text-zinc-700 block mb-2">Pilih Bulan Laporan</label>
        <input type="month" value={bulan} onChange={(e) => setBulan(e.target.value)} className="rounded-xl border border-zinc-200 px-4 py-2 text-sm bg-zinc-50" />
      </div>

      <div className="bg-white p-8 md:p-12 shadow-sm border border-zinc-200 print:border-0 print:shadow-none print:p-0">
        
        <div className="text-center border-b-4 border-double border-black pb-4 mb-6">
          <h1 className="text-xl font-bold uppercase">Laporan Kegiatan Literasi Desa</h1>
          <h2 className="text-lg font-bold">Desa Nanjung, Kecamatan Margaasih, Kabupaten Bandung</h2>
          <p className="text-sm font-bold mt-2">Periode: {new Date(bulan).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
        </div>

        <table className="w-full text-xs text-left border-collapse border border-black">
          <thead>
            <tr className="bg-zinc-50 border-b border-black print:bg-transparent">
              <th className="border-r border-black p-2 text-center w-8">No</th>
              <th className="border-r border-black p-2">Tanggal</th>
              <th className="border-r border-black p-2">Nama Kegiatan</th>
              <th className="border-r border-black p-2">Jenis Literasi</th>
              <th className="border-r border-black p-2">Sasaran</th>
              <th className="border-r border-black p-2 text-center">Peserta</th>
              <th className="p-2">Hasil</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr><td colSpan="7" className="p-4 text-center italic">Tidak ada data pada bulan ini.</td></tr>
            ) : (
              filteredData.map((k, idx) => (
                <tr key={k.id} className="border-b border-black">
                  <td className="border-r border-black p-2 text-center">{idx + 1}</td>
                  <td className="border-r border-black p-2">{k.tanggal}</td>
                  <td className="border-r border-black p-2 font-semibold">{k.nama_kegiatan}</td>
                  <td className="border-r border-black p-2">{k.jenis_literasi}</td>
                  <td className="border-r border-black p-2">{k.sasaran}</td>
                  <td className="border-r border-black p-2 text-center">{k.jumlah_peserta}</td>
                  <td className="p-2">{k.hasil}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex justify-between mt-16 text-sm">
          <div className="text-center w-64">
            <p>Mengetahui,</p>
            <p>Kepala Desa Nanjung</p>
            <div className="h-20"></div>
            <p className="font-bold underline">DIAN IRAWAN.SE</p>
          </div>
          <div className="text-center w-64">
            <p>Nanjung, {new Date().toLocaleDateString('id-ID')}</p>
            <p>Penggerak Literasi</p>
            <div className="h-20"></div>
            <p className="font-bold underline">.................................</p>
          </div>
        </div>

      </div>
    </div>
  );
}