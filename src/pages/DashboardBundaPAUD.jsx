import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Users, School, Coins, AlertTriangle, Plus, Trash2, X, Save, Loader2, Calendar } from 'lucide-react';
import Toast from '../components/Toast';
import { RW_LIST, POSYANDU_LIST } from '../lib/data';

export default function DashboardBundaPAUD() {
  const { user } = useAuth();
  // Tambahkan 'kegiatan' ke dalam state tab
  const [activeTab, setActiveTab] = useState('anak'); 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({});

  const fetchData = async () => {
    setLoading(true);
    let tableName = '';
    if (activeTab === 'anak') tableName = 'paud_anak';
    if (activeTab === 'kegiatan') tableName = 'paud_kegiatan'; // <-- Tabel baru
    if (activeTab === 'satuan') tableName = 'paud_satuan';
    if (activeTab === 'dana') tableName = 'paud_dana';
    if (activeTab === 'ats') tableName = 'paud_ats';

    const { data: res } = await supabase.from(tableName).select('*').order('created_at', { ascending: false });
    setData(res || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    setForm({});
  }, [activeTab]);

  const handleSimpan = async (e) => {
    e.preventDefault();
    setSaving(true);
    let tableName = '';
    if (activeTab === 'anak') tableName = 'paud_anak';
    if (activeTab === 'kegiatan') tableName = 'paud_kegiatan';
    if (activeTab === 'satuan') tableName = 'paud_satuan';
    if (activeTab === 'dana') tableName = 'paud_dana';
    if (activeTab === 'ats') tableName = 'paud_ats';

    const { error } = await supabase.from(tableName).insert([{ ...form, created_by: user.id }]);
    if (error) setToast({ msg: 'Gagal: ' + error.message, type: 'error' });
    else {
      setToast({ msg: 'Data berhasil disimpan', type: 'success' });
      setShowModal(false);
      fetchData();
    }
    setSaving(false);
  };

  const handleHapus = async (id) => {
    if (!confirm('Hapus data ini?')) return;
    let tableName = '';
    if (activeTab === 'anak') tableName = 'paud_anak';
    if (activeTab === 'kegiatan') tableName = 'paud_kegiatan';
    if (activeTab === 'satuan') tableName = 'paud_satuan';
    if (activeTab === 'dana') tableName = 'paud_dana';
    if (activeTab === 'ats') tableName = 'paud_ats';
    
    await supabase.from(tableName).delete().eq('id', id);
    fetchData();
  };

  // Render Form Berdasarkan Tab
  const renderForm = () => {
    if (activeTab === 'anak') {
      return (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold block mb-1">Nama Anak *</label>
              <input type="text" className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, nama_anak: e.target.value})} required />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">NIK Anak</label>
              <input type="text" maxLength={16} className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, nik_anak: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Nama Orang Tua</label>
            <input type="text" className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, nama_orang_tua: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">NIK Orang Tua</label>
            <input type="text" maxLength={16} className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, nik_orang_tua: e.target.value})} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-bold block mb-1">Tgl Lahir</label>
              <input type="date" className="w-full border rounded-xl px-2 py-2 text-sm" onChange={e => setForm({...form, tanggal_lahir: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">L/P</label>
              <select className="w-full border rounded-xl px-2 py-2 text-sm" onChange={e => setForm({...form, jenis_kelamin: e.target.value})}>
                <option value="L">L</option>
                <option value="P">P</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">RT</label>
              <input type="text" className="w-full border rounded-xl px-2 py-2 text-sm" onChange={e => setForm({...form, rt: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Status PAUD</label>
            <select className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, status_paud: e.target.value})}>
              <option value="Aktif">Aktif</option>
              <option value="Belum Terdaftar">Belum Terdaftar</option>
            </select>
          </div>
        </>
      );
    }

        // --- FORM KEGIATAN BARU ---
    if (activeTab === 'kegiatan') {
      return (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold block mb-1">Tanggal *</label>
              <input type="date" className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, tanggal: e.target.value})} required />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">Kategori Program</label>
              <select className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, jenis: e.target.value})}>
                <option value="Pendataan">Perencanaan & Pendataan (Musrenbang, Profil PAUD)</option>
                <option value="Sosialisasi">Sosialisasi & Advokasi (Ayo ke PAUD, Parenting)</option>
                <option value="Kesehatan">Kesehatan & PAUD HI (Stunting, Imunisasi, DDTK)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Judul/Nama Kegiatan *</label>
            <input type="text" className="w-full border rounded-xl px-3 py-2" placeholder="Cth: Musrenbangdes PAUD" onChange={e => setForm({...form, judul: e.target.value})} required />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold block mb-1">Sasaran</label>
              <select className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, sasaran: e.target.value})}>
                <option value="Anak PAUD">Anak PAUD (0-6 Tahun)</option>
                <option value="Orang Tua">Orang Tua / Wali</option>
                <option value="Guru PAUD">Guru / Pengelola PAUD</option>
                <option value="Lembaga PAUD">Lembaga (TK/KB/SPS)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">Jumlah Peserta</label>
              <input type="number" className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, jumlah_peserta: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold block mb-1">Lokasi</label>
              <input type="text" className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, lokasi: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">Mitra / Kerjasama</label>
              <input type="text" className="w-full border rounded-xl px-3 py-2" placeholder="Cth: Posyandu, KPM, Puskesmas" onChange={e => setForm({...form, mitra: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1">Hasil / Kesepakatan</label>
            <textarea rows={2} className="w-full border rounded-xl px-3 py-2" placeholder="Cth: Disepakati penambahan 1 KB di RW 05" onChange={e => setForm({...form, hasil: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Kendala</label>
            <textarea rows={2} className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, kendala: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Tindak Lanjut</label>
            <textarea rows={2} className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, tindak_lanjut: e.target.value})} />
          </div>
        </>
      );
    }

    if (activeTab === 'satuan') {
      return (
        <>
          <div>
            <label className="text-xs font-bold block mb-1">Nama Lembaga PAUD *</label>
            <input type="text" className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, nama_lembaga: e.target.value})} required />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Jenis Lembaga</label>
            <select className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, jenis: e.target.value})}>
              <option value="TK">TK</option>
              <option value="KB">KB</option>
              <option value="SPS">SPS</option>
              <option value="TPA">TPA</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold block mb-1">Jumlah Guru</label>
              <input type="number" className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, jumlah_guru: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">Jumlah Siswa</label>
              <input type="number" className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, jumlah_siswa: e.target.value})} />
            </div>
          </div>
        </>
      );
    }
    if (activeTab === 'dana') {
      return (
        <>
          <div>
            <label className="text-xs font-bold block mb-1">Tahun Anggaran *</label>
            <input type="number" className="w-full border rounded-xl px-3 py-2" defaultValue={new Date().getFullYear()} onChange={e => setForm({...form, tahun: e.target.value})} required />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Sumber Dana</label>
            <select className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, sumber_dana: e.target.value})}>
              <option value="Dana Desa">Dana Desa (APBDes)</option>
              <option value="Bantuan Provinsi">Bantuan Provinsi</option>
              <option value="Swadaya">Swadaya Masyarakat</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Jumlah Dana (Rp)</label>
            <input type="number" className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, jumlah_dana: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Peruntukan</label>
            <input type="text" className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, peruntukan: e.target.value})} />
          </div>
        </>
      );
    }
    if (activeTab === 'ats') {
      return (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold block mb-1">Nama Anak *</label>
              <input type="text" className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, nama_anak: e.target.value})} required />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">NIK Anak</label>
              <input type="text" maxLength={16} className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, nik_anak: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">NIK Orang Tua</label>
            <input type="text" maxLength={16} className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, nik_orang_tua: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold block mb-1">Tempat Lahir</label>
              <input type="text" className="w-full border rounded-xl px-3 py-2" placeholder="Cth: Bandung" onChange={e => setForm({...form, tempat_lahir: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">Tanggal Lahir</label>
              <input type="date" className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, tanggal_lahir: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-bold block mb-1">RT</label>
              <input type="text" className="w-full border rounded-xl px-2 py-2 text-sm" onChange={e => setForm({...form, rt: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">RW</label>
              <select className="w-full border rounded-xl px-2 py-2 text-sm" onChange={e => setForm({...form, rw: e.target.value})}>
                {RW_LIST.map(rw => <option key={rw} value={rw}>{rw}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">Kelas Terakhir</label>
              <input type="text" className="w-full border rounded-xl px-2 py-2 text-sm" onChange={e => setForm({...form, kelas_terakhir: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Pendidikan Terakhir</label>
            <input type="text" className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, pendidikan_terakhir: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Alasan Putus Sekolah</label>
            <input type="text" className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, alasan_putus: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Status Penanganan</label>
            <select className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, status_penanganan: e.target.value})}>
              <option value="Belum Ditangani">Belum Ditangani</option>
              <option value="Sedang Diproses">Sedang Diproses</option>
              <option value="Sudah Kembali Sekolah">Sudah Kembali Sekolah</option>
            </select>
          </div>
        </>
      );
    }
  };

  return (
    <div className="space-y-6 relative">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Dashboard Bunda PAUD</h1>
          <p className="text-sm text-[var(--text-muted)]">Manajemen data Pendidikan Anak Usia Dini.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-[var(--primary)] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[var(--primary-2)] transition">
          <Plus className="w-4 h-4" /> Tambah Data
        </button>
      </div>

      {/* Navigasi Tab - Tambahkan Tab Kegiatan */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {[
          { id: 'anak', label: 'Pendataan Anak', icon: Users },
          { id: 'kegiatan', label: 'Kegiatan PAUD', icon: Calendar }, // <-- TAB BARU
          { id: 'satuan', label: 'Satuan PAUD', icon: School },
          { id: 'dana', label: 'Advokasi Dana', icon: Coins },
          { id: 'ats', label: 'Anak Putus Sekolah', icon: AlertTriangle },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition ${
              activeTab === tab.id ? 'bg-[var(--primary)] text-white shadow-sm' : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tabel Data */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-[var(--surface-2)] text-[var(--text-muted)] text-xs uppercase">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">
                  {activeTab === 'anak' ? 'Nama Anak / NIK' : activeTab === 'kegiatan' ? 'Judul Kegiatan' : activeTab === 'satuan' ? 'Nama Lembaga' : activeTab === 'dana' ? 'Peruntukan' : 'Nama Anak / NIK'}
                </th>
                <th className="px-4 py-3">
                  {activeTab === 'anak' ? 'Orang Tua' : activeTab === 'kegiatan' ? 'Jenis / Tanggal' : activeTab === 'satuan' ? 'Jenis' : activeTab === 'dana' ? 'Jumlah (Rp)' : 'Pendidikan / Kelas'}
                </th>
                <th className="px-4 py-3">
                  {activeTab === 'anak' ? 'Status PAUD' : activeTab === 'kegiatan' ? 'Lokasi / Peserta' : activeTab === 'satuan' ? 'Guru / Siswa' : activeTab === 'dana' ? 'Sumber' : 'Status Penanganan'}
                </th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8">Memuat data...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-[var(--text-muted)]">Belum ada data pada tab ini.</td></tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-[var(--surface-2)] transition">
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-[var(--text)]">
                        {activeTab === 'anak' ? item.nama_anak : activeTab === 'kegiatan' ? item.judul : activeTab === 'satuan' ? item.nama_lembaga : activeTab === 'dana' ? item.peruntukan : item.nama_anak}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        {activeTab === 'anak' || activeTab === 'ats' ? (item.nik_anak || '-') : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        {activeTab === 'anak' ? (item.nama_orang_tua || '-') : activeTab === 'kegiatan' ? `${item.jenis} (${item.tanggal})` : activeTab === 'satuan' ? item.jenis : activeTab === 'dana' ? `Rp ${Number(item.jumlah_dana || 0).toLocaleString('id-ID')}` : `${item.pendidikan_terakhir || '-'} / ${item.kelas_terakhir || '-'}`}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        {activeTab === 'anak' || activeTab === 'ats' ? (item.nik_orang_tua ? `NIK: ${item.nik_orang_tua}` : '') : ''}
                        {activeTab === 'ats' && item.tempat_lahir && ` | ${item.tempat_lahir}, ${item.tanggal_lahir || ''}`}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {activeTab === 'anak' ? item.status_paud : activeTab === 'kegiatan' ? `${item.lokasi || '-'} / ${item.jumlah_peserta || 0} org` : activeTab === 'satuan' ? `${item.jumlah_guru || 0} / ${item.jumlah_siswa || 0}` : activeTab === 'dana' ? item.sumber_dana : <span className="font-bold text-amber-600">{item.status_penanganan}</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleHapus(item.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--surface)] rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface-2)]">
              <h3 className="font-bold text-[var(--text)]">Tambah Data {activeTab.toUpperCase()}</h3>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text)]"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSimpan} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {renderForm()}
              <div className="pt-4 flex gap-2 justify-end border-t border-[var(--border)]">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-bold text-[var(--text-muted)] hover:bg-[var(--surface-2)] rounded-xl transition">Batal</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-2)] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}