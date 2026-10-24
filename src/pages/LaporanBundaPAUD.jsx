import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Printer, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LaporanBundaPAUD() {
  const [dataAnak, setDataAnak] = useState([]);
  const [dataKegiatan, setDataKegiatan] = useState([]);
  const [dataSatuan, setDataSatuan] = useState([]);
  const [dataDana, setDataDana] = useState([]);
  const [dataAts, setDataAts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [
        resAnak, resKegiatan, resSatuan, resDana, resAts
      ] = await Promise.all([
        supabase.from('paud_anak').select('*').order('nama_anak'),
        supabase.from('paud_kegiatan').select('*').order('tanggal', { ascending: false }),
        supabase.from('paud_satuan').select('*').order('nama_lembaga'),
        supabase.from('paud_dana').select('*').order('tahun', { ascending: false }),
        supabase.from('paud_ats').select('*').order('nama_anak')
      ]);

      if (resAnak.data) setDataAnak(resAnak.data);
      if (resKegiatan.data) setDataKegiatan(resKegiatan.data);
      if (resSatuan.data) setDataSatuan(resSatuan.data);
      if (resDana.data) setDataDana(resDana.data);
      if (resAts.data) setDataAts(resAts.data);
      
      setLoading(false);
    };
    fetchAll();
  }, []);

  const handleCetak = () => window.print();

  const totalDana = useMemo(() => {
    return dataDana.reduce((a, d) => a + (Number(d.jumlah_dana) || 0), 0);
  }, [dataDana]);

  if (loading) return <div className="p-10 text-center">Memuat data laporan...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Tombol Aksi (Disembunyikan saat print) */}
      <div className="print:hidden flex items-center justify-between">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text)]">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>
        <button onClick={handleCetak} className="inline-flex items-center gap-2 bg-[var(--primary)] text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-[var(--primary-2)] transition">
          <Printer className="w-4 h-4" /> Cetak Laporan (PDF)
        </button>
      </div>

      {/* Konten Laporan */}
      <div className="bg-white p-8 md:p-12 shadow-sm border border-zinc-200 print:border-0 print:shadow-none print:p-0">
        
        {/* Kop Laporan */}
        <div className="text-center border-b-4 border-double border-black pb-4 mb-6">
          <h1 className="text-xl font-bold uppercase">Laporan Program Bunda PAUD</h1>
          <h2 className="text-lg font-bold">Desa Nanjung, Kecamatan Margaasih, Kabupaten Bandung</h2>
          <p className="text-sm mt-1">Tahun Anggaran {new Date().getFullYear()}</p>
        </div>

        {/* Rekap Singkat */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-sm">
          <div className="border border-zinc-200 p-3 rounded-xl print:border-black">
            <div className="text-zinc-500">Total Anak Terdata</div>
            <div className="font-bold text-xl">{dataAnak.length} Anak</div>
          </div>
          <div className="border border-zinc-200 p-3 rounded-xl print:border-black">
            <div className="text-zinc-500">Total Lembaga PAUD</div>
            <div className="font-bold text-xl">{dataSatuan.length} Lembaga</div>
          </div>
          <div className="border border-zinc-200 p-3 rounded-xl print:border-black">
            <div className="text-zinc-500">Total Anak Putus Sekolah</div>
            <div className="font-bold text-xl">{dataAts.length} Anak</div>
          </div>
          <div className="border border-zinc-200 p-3 rounded-xl print:border-black">
            <div className="text-zinc-500">Total Advokasi Dana</div>
            <div className="font-bold text-xl">Rp {totalDana.toLocaleString('id-ID')}</div>
          </div>
        </div>

        {/* 1. Tabel Kegiatan */}
        <h3 className="font-bold text-lg mb-2 mt-6">A. Rekapitulasi Kegiatan Bunda PAUD</h3>
        <table className="w-full text-xs text-left border-collapse border border-black mb-6">
          <thead>
            <tr className="bg-zinc-50 border-b border-black print:bg-transparent">
              <th className="border-r border-black p-2 text-center w-8">No</th>
              <th className="border-r border-black p-2">Tanggal</th>
              <th className="border-r border-black p-2">Kategori</th>
              <th className="border-r border-black p-2">Nama Kegiatan</th>
              <th className="border-r border-black p-2">Sasaran</th>
              <th className="border-r border-black p-2 text-center">Peserta</th>
              <th className="border-r border-black p-2">Mitra</th>
              <th className="p-2">Hasil</th>
            </tr>
          </thead>
          <tbody>
            {dataKegiatan.length === 0 ? (
              <tr><td colSpan="8" className="p-3 text-center italic">Belum ada data kegiatan.</td></tr>
            ) : (
              dataKegiatan.map((k, i) => (
                <tr key={k.id} className="border-b border-black">
                  <td className="border-r border-black p-2 text-center">{i + 1}</td>
                  <td className="border-r border-black p-2">{k.tanggal}</td>
                  <td className="border-r border-black p-2">{k.jenis}</td>
                  <td className="border-r border-black p-2 font-semibold">{k.judul}</td>
                  <td className="border-r border-black p-2">{k.sasaran}</td>
                  <td className="border-r border-black p-2 text-center">{k.jumlah_peserta}</td>
                  <td className="border-r border-black p-2">{k.mitra || '-'}</td>
                  <td className="p-2">{k.hasil || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* 2. Tabel Satuan PAUD */}
        <h3 className="font-bold text-lg mb-2 mt-6">B. Data Satuan Lembaga PAUD</h3>
        <table className="w-full text-xs text-left border-collapse border border-black mb-6">
          <thead>
            <tr className="bg-zinc-50 border-b border-black print:bg-transparent">
              <th className="border-r border-black p-2 text-center w-8">No</th>
              <th className="border-r border-black p-2">Nama Lembaga</th>
              <th className="border-r border-black p-2">Jenis</th>
              <th className="border-r border-black p-2 text-center">Jml Guru</th>
              <th className="border-r border-black p-2 text-center">Jml Siswa</th>
              <th className="border-r border-black p-2">Status Izin</th>
              <th className="p-2">Alamat / RW</th>
            </tr>
          </thead>
          <tbody>
            {dataSatuan.length === 0 ? (
              <tr><td colSpan="7" className="p-3 text-center italic">Belum ada data lembaga PAUD.</td></tr>
            ) : (
              dataSatuan.map((s, i) => (
                <tr key={s.id} className="border-b border-black">
                  <td className="border-r border-black p-2 text-center">{i + 1}</td>
                  <td className="border-r border-black p-2 font-semibold">{s.nama_lembaga}</td>
                  <td className="border-r border-black p-2">{s.jenis}</td>
                  <td className="border-r border-black p-2 text-center">{s.jumlah_guru}</td>
                  <td className="border-r border-black p-2 text-center">{s.jumlah_siswa}</td>
                  <td className="border-r border-black p-2">{s.status_izin || '-'}</td>
                  <td className="p-2">{s.alamat} {s.rw ? `(RW ${s.rw})` : ''}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* 3. Tabel Advokasi Dana */}
        <h3 className="font-bold text-lg mb-2 mt-6">C. Advokasi Dana PAUD</h3>
        <table className="w-full text-xs text-left border-collapse border border-black mb-6">
          <thead>
            <tr className="bg-zinc-50 border-b border-black print:bg-transparent">
              <th className="border-r border-black p-2 text-center w-8">No</th>
              <th className="border-r border-black p-2">Tahun</th>
              <th className="border-r border-black p-2">Sumber Dana</th>
              <th className="border-r border-black p-2 text-right">Jumlah (Rp)</th>
              <th className="p-2">Peruntukan</th>
            </tr>
          </thead>
          <tbody>
            {dataDana.length === 0 ? (
              <tr><td colSpan="5" className="p-3 text-center italic">Belum ada data advokasi dana.</td></tr>
            ) : (
              dataDana.map((d, i) => (
                <tr key={d.id} className="border-b border-black">
                  <td className="border-r border-black p-2 text-center">{i + 1}</td>
                  <td className="border-r border-black p-2">{d.tahun}</td>
                  <td className="border-r border-black p-2">{d.sumber_dana}</td>
                  <td className="border-r border-black p-2 text-right">{Number(d.jumlah_dana).toLocaleString('id-ID')}</td>
                  <td className="p-2">{d.peruntukan}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* 4. Tabel Anak Putus Sekolah (ATS) */}
        <h3 className="font-bold text-lg mb-2 mt-6">D. Data Anak Putus Sekolah (ATS)</h3>
        <table className="w-full text-xs text-left border-collapse border border-black mb-6">
          <thead>
            <tr className="bg-zinc-50 border-b border-black print:bg-transparent">
              <th className="border-r border-black p-2 text-center w-8">No</th>
              <th className="border-r border-black p-2">Nama Anak</th>
              <th className="border-r border-black p-2">Tempat, Tgl Lahir</th>
              <th className="border-r border-black p-2">Pendidikan/Kelas</th>
              <th className="border-r border-black p-2">Alasan</th>
              <th className="p-2">Status Penanganan</th>
            </tr>
          </thead>
          <tbody>
            {dataAts.length === 0 ? (
              <tr><td colSpan="6" className="p-3 text-center italic">Tidak ada data anak putus sekolah.</td></tr>
            ) : (
              dataAts.map((a, i) => (
                <tr key={a.id} className="border-b border-black">
                  <td className="border-r border-black p-2 text-center">{i + 1}</td>
                  <td className="border-r border-black p-2 font-semibold">{a.nama_anak}</td>
                  <td className="border-r border-black p-2">{a.tempat_lahir || '-'}, {a.tanggal_lahir || '-'}</td>
                  <td className="border-r border-black p-2">{a.pendidikan_terakhir} / {a.kelas_terakhir}</td>
                  <td className="border-r border-black p-2">{a.alasan_putus}</td>
                  <td className="p-2 font-bold">{a.status_penanganan}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Tanda Tangan */}
        <div className="flex justify-between mt-16 text-sm">
          <div className="text-center w-64">
            <p>Mengetahui,</p>
            <p>Kepala Desa Nanjung</p>
            <div className="h-20"></div>
            <p className="font-bold underline">DIAN IRAWAN.SE</p>
          </div>
          <div className="text-center w-64">
            <p>Nanjung, {new Date().toLocaleDateString('id-ID')}</p>
            <p>Bunda PAUD Desa</p>
            <div className="h-20"></div>
            <p className="font-bold underline">.................................</p>
          </div>
        </div>

      </div>
    </div>
  );
}