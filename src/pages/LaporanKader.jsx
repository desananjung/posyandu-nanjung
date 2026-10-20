import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useKegiatan } from '../hooks/useKegiatan';
import { Printer, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BIDANG } from '../lib/data';

export default function LaporanKader() {
  const { user } = useAuth();
  const { kegiatan, loading } = useKegiatan();
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7)); // format YYYY-MM

  // Filter kegiatan milik kader ini (berdasarkan RW / Posyandu) dan bulan yang dipilih
  const laporanKegiatan = useMemo(() => {
    return kegiatan.filter(k => 
      (k.rw === user.rw || k.posyandu === user.posyandu) && 
      k.tanggal.startsWith(bulan)
    );
  }, [kegiatan, user, bulan]);

  // Kelompokkan kegiatan berdasarkan bidang
  const groupedByBidang = useMemo(() => {
    const groups = {};
    BIDANG.forEach(b => {
      const data = laporanKegiatan.filter(k => k.bidang === b.id);
      if (data.length > 0) groups[b.id] = { info: b, items: data };
    });
    return groups;
  }, [laporanKegiatan]);

  const handleCetak = () => {
    window.print();
  };

  if (loading) return <div className="p-10 text-center">Memuat data...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Tombol Aksi (Disembunyikan saat print) */}
      <div className="print:hidden flex items-center justify-between">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>
        <button onClick={handleCetak} className="inline-flex items-center gap-2 bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm">
          <Printer className="w-4 h-4" /> Cetak Laporan (PDF)
        </button>
      </div>

      {/* Filter Bulan */}
      <div className="print:hidden bg-white p-4 rounded-2xl border border-zinc-200">
        <label className="text-xs font-bold text-zinc-700 block mb-2">Pilih Bulan Laporan</label>
        <input 
          type="month" 
          value={bulan} 
          onChange={(e) => setBulan(e.target.value)} 
          className="rounded-xl border border-zinc-200 px-4 py-2 text-sm bg-zinc-50 focus:ring-2 focus:ring-emerald-500" 
        />
      </div>

      {/* AREA CETAK (Kertas Laporan) */}
      <div className="bg-white p-8 md:p-12 shadow-sm border border-zinc-200 print:border-0 print:shadow-none print:p-0">
        
        {/* KOP LAPORAN */}
        <div className="text-center border-b-4 border-double border-black pb-4 mb-6">
          <h1 className="text-xl font-bold uppercase">Laporan Kegiatan Posyandu 6 SPM</h1>
          <h2 className="text-lg font-bold">Posyandu {user?.posyandu || user?.rw}</h2>
          <p className="text-sm">Desa Nanjung, Kecamatan Margaasih, Kabupaten Bandung</p>
          <p className="text-sm font-bold mt-2">Periode: {new Date(bulan).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
        </div>

        {/* IDENTITAS POSYANDU */}
        <div className="mb-8 text-sm grid grid-cols-2 gap-2">
          <div>
            <div className="grid grid-cols-[140px_1fr]"><span>Nama Posyandu</span><span>: {user?.posyandu || '-'}</span></div>
            <div className="grid grid-cols-[140px_1fr]"><span>Lokasi / RW</span><span>: {user?.rw || '-'}</span></div>
            <div className="grid grid-cols-[140px_1fr]"><span>Desa / Kecamatan</span><span>: Nanjung / Margaasih</span></div>
          </div>
          <div>
            <div className="grid grid-cols-[140px_1fr]"><span>Jumlah Kader Aktif</span><span>: 5 Orang</span></div>
            <div className="grid grid-cols-[140px_1fr]"><span>Total Kegiatan</span><span>: {laporanKegiatan.length} Kegiatan</span></div>
          </div>
        </div>

        {/* LOOPING TABEL PER BIDANG SPM */}
        {Object.keys(groupedByBidang).length === 0 ? (
          <div className="text-center py-10 italic text-zinc-500">Belum ada data kegiatan pada bulan ini.</div>
        ) : (
          Object.entries(groupedByBidang).map(([bidangId, { info, items }]) => (
            <div key={bidangId} className="mb-10 page-break-inside-avoid">
              <h3 className="font-bold text-md bg-zinc-100 p-2 border border-black print:bg-transparent">
                REKAP KEGIATAN BIDANG SPM: {info.name.toUpperCase()}
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse border border-black">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-black">
                      <th className="border-r border-black p-2 w-8 text-center">No</th>
                      {/* HEADER DINAMIS BERDASARKAN BIDANG */}
                      {bidangId === 'sosial' && (
                        <>
                          <th className="border-r border-black p-2">Jenis Pelayanan Sosial</th>
                          <th className="border-r border-black p-2 text-center">Sasaran</th>
                          <th className="border-r border-black p-2 text-center">Jml Terlayani</th>
                        </>
                      )}
                      {bidangId === 'pekerjaan_umum' && (
                        <>
                          <th className="border-r border-black p-2">Jenis Infrastruktur</th>
                          <th className="border-r border-black p-2">Kondisi Saat Ini</th>
                          <th className="border-r border-black p-2">Rekomendasi</th>
                        </>
                      )}
                      {bidangId === 'perumahan' && (
                        <>
                          <th className="border-r border-black p-2">Nama Keluarga</th>
                          <th className="border-r border-black p-2">Sasaran (Ibu/Balita/Lansia)</th>
                          <th className="border-r border-black p-2">Kondisi Rumah / Sanitasi</th>
                        </>
                      )}
                      {bidangId === 'pendidikan' && (
                        <>
                          <th className="border-r border-black p-2">Jenis Kegiatan</th>
                          <th className="border-r border-black p-2 text-center">Sasaran</th>
                          <th className="border-r border-black p-2 text-center">Jml Peserta</th>
                        </>
                      )}
                      {bidangId === 'trantibum' && (
                        <>
                          <th className="border-r border-black p-2">Jenis Kegiatan</th>
                          <th className="border-r border-black p-2">Uraian</th>
                          <th className="border-r border-black p-2">Hasil / Temuan</th>
                        </>
                      )}
                      {bidangId === 'kesehatan' && (
                        <>
                          <th className="border-r border-black p-2">Jenis SPM</th>
                          <th className="border-r border-black p-2">Sasaran</th>
                          <th className="border-r border-black p-2 text-center">Terlayani</th>
                        </>
                      )}
                      
                      {/* HEADER YANG SAMA UNTUK SEMUA BIDANG */}
                      <th className="border-r border-black p-2">Bentuk Layanan / Hasil</th>
                      <th className="border-r border-black p-2 text-center">Mitra</th>
                      <th className="border-r border-black p-2">Kendala</th>
                      <th className="p-2">Tindak Lanjut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((k, index) => (
                      <tr key={k.id} className="border-b border-black">
                        <td className="border-r border-black p-2 text-center">{index + 1}</td>
                        
                        {/* KONTEN DINAMIS BERDASARKAN BIDANG */}
                        {bidangId === 'sosial' && (
                          <>
                            <td className="border-r border-black p-2">{k.nama_kegiatan}</td>
                            <td className="border-r border-black p-2 text-center">{k.sasaran}</td>
                            <td className="border-r border-black p-2 text-center">{k.sasaran}</td>
                          </>
                        )}
                        {bidangId === 'pekerjaan_umum' && (
                          <>
                            <td className="border-r border-black p-2">{k.nama_kegiatan}</td>
                            <td className="border-r border-black p-2">-</td>
                            <td className="border-r border-black p-2">-</td>
                          </>
                        )}
                        {bidangId === 'perumahan' && (
                          <>
                            <td className="border-r border-black p-2">-</td>
                            <td className="border-r border-black p-2 text-center">{k.sasaran}</td>
                            <td className="border-r border-black p-2">-</td>
                          </>
                        )}
                        {bidangId === 'pendidikan' && (
                          <>
                            <td className="border-r border-black p-2">{k.nama_kegiatan}</td>
                            <td className="border-r border-black p-2 text-center">{k.sasaran}</td>
                            <td className="border-r border-black p-2 text-center">{k.sasaran}</td>
                          </>
                        )}
                        {bidangId === 'trantibum' && (
                          <>
                            <td className="border-r border-black p-2">{k.sub_bidang}</td>
                            <td className="border-r border-black p-2">{k.nama_kegiatan}</td>
                            <td className="border-r border-black p-2">{k.hasil}</td>
                          </>
                        )}
                        {bidangId === 'kesehatan' && (
                          <>
                            <td className="border-r border-black p-2">{k.sub_bidang}</td>
                            <td className="border-r border-black p-2 text-center">{k.sasaran}</td>
                            <td className="border-r border-black p-2 text-center">{k.sasaran}</td>
                          </>
                        )}

                        {/* KONTEN YANG SAMA UNTUK SEMUA BIDANG */}
                        <td className="border-r border-black p-2">{k.hasil || '-'}</td>
                        <td className="border-r border-black p-2 text-center">-</td>
                        <td className="border-r border-black p-2">{k.kendala || '-'}</td>
                        <td className="p-2">{k.tindak_lanjut || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}

        {/* TANDA TANGAN */}
        <div className="flex justify-between mt-16 text-sm">
          <div className="text-center w-64">
            <p>Mengetahui,</p>
            <p>Kepala Desa Nanjung</p>
            <div className="h-20"></div>
            <p className="font-bold underline">H. Dadan Supardan</p>
          </div>
          <div className="text-center w-64">
            <p>Nanjung, {new Date().toLocaleDateString('id-ID')}</p>
            <p>Kader Posyandu</p>
            <div className="h-20"></div>
            <p className="font-bold underline">{user?.nama}</p>
          </div>
        </div>

      </div>
    </div>
  );
}