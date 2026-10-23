import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Users, School, Coins, AlertTriangle, Plus, Trash2, X, Save, Loader2 } from 'lucide-react';
import Toast from '../components/Toast';
import { RW_LIST, POSYANDU_LIST } from '../lib/data';

export default function DashboardBundaPAUD() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('anak'); // 'anak', 'satuan', 'dana', 'ats'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // State Form (menyesuaikan tab)
  const [form, setForm] = useState({});

  const fetchData = async () => {
    setLoading(true);
    let tableName = '';
    if (activeTab === 'anak') tableName = 'paud_anak';
    if (activeTab === 'satuan') tableName = 'paud_satuan';
    if (activeTab === 'dana') tableName = 'paud_dana';
    if (activeTab === 'ats') tableName = 'paud_ats';

    const { data: res } = await supabase.from(tableName).select('*').order('created_at', { ascending: false });
    setData(res || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // Reset form saat ganti tab
    setForm({});
  }, [activeTab]);

  const handleSimpan = async (e) => {
    e.preventDefault();
    setSaving(true);
    let tableName = '';
    if (activeTab === 'anak') tableName = 'paud_anak';
    if (activeTab === 'satuan') tableName = 'paud_satuan';
    if (activeTab === 'dana') tableName = 'paud_dana';
    if (activeTab === 'ats') tableName = 'paud_ats';

    const { error } = await supabase.from(tableName).insert([form]);
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
          <div>
            <label className="text-xs font-bold block mb-1">Nama Anak *</label>
            <input type="text" className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, nama_anak: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold block mb-1">Tanggal Lahir</label>
              <input type="date" className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, tanggal_lahir: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">Jenis Kelamin</label>
              <select className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, jenis_kelamin: e.target.value})}>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Nama Orang Tua</label>
            <input type="text" className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, nama_orang_tua: e.target.value})} />
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
              <option value="TK">TK (Taman Kanak-kanak)</option>
              <option value="KB">KB (Kelompok Bermain)</option>
              <option value="SPS">SPS (Satuan PAUD Sejenis)</option>
              <option value="TPA">TPA (Taman Penitipan Anak)</option>
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
            <input type="text" className="w-full border rounded-xl px-3 py-2" placeholder="Contoh: Honor Guru, Alat Peraga" onChange={e => setForm({...form, peruntukan: e.target.value})} />
          </div>
        </>
      );
    }
    if (activeTab === 'ats') {
      return (
        <>
          <div>
            <label className="text-xs font-bold block mb-1">Nama Anak Putus Sekolah *</label>
            <input type="text" className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, nama_anak: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold block mb-1">Umur</label>
              <input type="number" className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, umur: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">RW</label>
              <select className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, rw: e.target.value})}>
                {RW_LIST.map(rw => <option key={rw} value={rw}>{rw}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Alasan Putus Sekolah</label>
            <input type="text" className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, alasan_putus: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Tindak Lanjut</label>
            <input type="text" className="w-full border rounded-xl px-3 py-2" onChange={e => setForm({...form, tindak_lanjut: e.target.value})} />
          </div>
        </>
      );
    }
  };

  return (
    <div className="space-y-6 relative">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header & Tombol Tambah */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Dashboard Bunda PAUD</h1>
          <p className="text-sm text-zinc-500">Manajemen data Pendidikan Anak Usia Dini & Literasi.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Data
        </button>
      </div>

      {/* Navigasi Tab */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {[
          { id: 'anak', label: 'Pendataan Anak', icon: Users },
          { id: 'satuan', label: 'Satuan PAUD', icon: School },
          { id: 'dana', label: 'Advokasi Dana', icon: Coins },
          { id: 'ats', label: 'Anak Putus Sekolah', icon: AlertTriangle },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition ${
              activeTab === tab.id ? 'bg-emerald-700 text-white shadow' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tabel Data */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">
                  {activeTab === 'anak' ? 'Nama Anak' : activeTab === 'satuan' ? 'Nama Lembaga' : activeTab === 'dana' ? 'Peruntukan' : 'Nama Anak'}
                </th>
                <th className="px-4 py-3">
                  {activeTab === 'anak' ? 'Status' : activeTab === 'satuan' ? 'Jenis' : activeTab === 'dana' ? 'Jumlah (Rp)' : 'Alasan'}
                </th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-8">Memuat data...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-8 text-zinc-500">Belum ada data pada tab ini.</td></tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50">
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3 font-bold">
                      {activeTab === 'anak' ? item.nama_anak : activeTab === 'satuan' ? item.nama_lembaga : activeTab === 'dana' ? item.peruntukan : item.nama_anak}
                    </td>
                    <td className="px-4 py-3">
                      {activeTab === 'anak' ? item.status_paud : activeTab === 'satuan' ? item.jenis : activeTab === 'dana' ? `Rp ${Number(item.jumlah_dana).toLocaleString('id-ID')}` : item.alasan_putus}
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
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
              <h3 className="font-bold text-zinc-900">Tambah Data {activeTab.toUpperCase()}</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-700"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSimpan} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {renderForm()}
              <div className="pt-4 flex gap-2 justify-end border-t border-zinc-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl">Batal</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
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