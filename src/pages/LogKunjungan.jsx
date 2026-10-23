import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, X, Save, Loader2 } from 'lucide-react';
import Toast from '../components/Toast';

export default function LogKunjungan() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [timList, setTimList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    tim_tpk_id: '',
    nama_keluarga: '',
    kategori_sasaran: 'Ibu Hamil',
    alamat: '',
    tujuan_kunjungan: 'Pemantauan',
    hasil_kunjungan: '',
    tindak_lanjut: ''
  });

  const fetchData = async () => {
    setLoading(true);
    const { data: res } = await supabase.from('log_kunjungan').select('*, tim_tpk(nama)').order('tanggal', { ascending: false });
    const { data: tim } = await supabase.from('tim_tpk').select('*');
    setData(res || []);
    setTimList(tim || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSimpan = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('log_kunjungan').insert([form]);
    if (error) setToast({ msg: 'Gagal: ' + error.message, type: 'error' });
    else {
      setToast({ msg: 'Log kunjungan dicatat', type: 'success' });
      setShowModal(false);
      fetchData();
    }
    setSaving(false);
  };

  const handleHapus = async (id) => {
    if (!confirm('Hapus log ini?')) return;
    await supabase.from('log_kunjungan').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="space-y-6 relative">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Log Kunjungan TPK</h1>
          <p className="text-sm text-zinc-500">Catat riwayat kunjungan ke rumah keluarga sasaran.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Catat Kunjungan
        </button>
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Nama Keluarga</th>
              <th className="px-4 py-3">Petugas (TPK)</th>
              <th className="px-4 py-3">Tujuan</th>
              <th className="px-4 py-3">Hasil</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan="6" className="text-center py-4">Memuat...</td></tr> : 
              data.map(item => (
                <tr key={item.id}>
                  <td className="px-4 py-3">{item.tanggal}</td>
                  <td className="px-4 py-3 font-bold">{item.nama_keluarga}</td>
                  <td className="px-4 py-3">{item.tim_tpk?.nama || '-'}</td>
                  <td className="px-4 py-3">{item.tujuan_kunjungan}</td>
                  <td className="px-4 py-3 text-xs">{item.hasil_kunjungan}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleHapus(item.id)} className="text-rose-600 p-1 hover:bg-rose-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Modal Tambah Log */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center bg-zinc-50 sticky top-0">
              <h3 className="font-bold">Form Kunjungan</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSimpan} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Tanggal</label>
                  <input type="date" className="w-full border rounded-xl px-3 py-2" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})} required />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Petugas (TPK)</label>
                  <select className="w-full border rounded-xl px-3 py-2" value={form.tim_tpk_id} onChange={e => setForm({...form, tim_tpk_id: e.target.value})} required>
                    <option value="">— Pilih Petugas —</option>
                    {timList.map(t => <option key={t.id} value={t.id}>{t.nama} ({t.peran})</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Nama Keluarga / Sasaran</label>
                <input type="text" className="w-full border rounded-xl px-3 py-2" value={form.nama_keluarga} onChange={e => setForm({...form, nama_keluarga: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Kategori Sasaran</label>
                  <select className="w-full border rounded-xl px-3 py-2" value={form.kategori_sasaran} onChange={e => setForm({...form, kategori_sasaran: e.target.value})}>
                    <option>Catin</option>
                    <option>Ibu Hamil</option>
                    <option>Baduta</option>
                    <option>Balita</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Tujuan Kunjungan</label>
                  <select className="w-full border rounded-xl px-3 py-2" value={form.tujuan_kunjungan} onChange={e => setForm({...form, tujuan_kunjungan: e.target.value})}>
                    <option>Pemantauan</option>
                    <option>Penyuluhan</option>
                    <option>Rujukan</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Hasil Kunjungan</label>
                <textarea className="w-full border rounded-xl px-3 py-2" rows="2" value={form.hasil_kunjungan} onChange={e => setForm({...form, hasil_kunjungan: e.target.value})} required />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Tindak Lanjut</label>
                <textarea className="w-full border rounded-xl px-3 py-2" rows="2" value={form.tindak_lanjut} onChange={e => setForm({...form, tindak_lanjut: e.target.value})} />
              </div>
              <button type="submit" disabled={saving} className="w-full bg-emerald-600 text-white py-2 rounded-xl font-bold">
                {saving ? 'Menyimpan...' : 'Simpan Log'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}