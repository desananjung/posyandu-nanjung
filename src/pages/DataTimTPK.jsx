import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Edit, X, Save, Loader2 } from 'lucide-react';
import Toast from '../components/Toast';
import { POSYANDU_LIST } from '../lib/data';

export default function DataTimTPK() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nama: '', peran: 'Kader PKK', posyandu: POSYANDU_LIST[0].nama, rw: 'RW01', no_hp: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const { data: res } = await supabase.from('tim_tpk').select('*').order('nama');
    setData(res || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSimpan = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('tim_tpk').insert([form]);
    if (error) setToast({ msg: 'Gagal: ' + error.message, type: 'error' });
    else {
      setToast({ msg: 'Anggota TPK ditambahkan', type: 'success' });
      setShowModal(false);
      setForm({ nama: '', peran: 'Kader PKK', posyandu: POSYANDU_LIST[0].nama, rw: 'RW01', no_hp: '' });
      fetchData();
    }
    setSaving(false);
  };

  const handleHapus = async (id) => {
    if (!confirm('Hapus anggota tim ini?')) return;
    await supabase.from('tim_tpk').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="space-y-6 relative">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Data Tim TPK</h1>
          <p className="text-sm text-zinc-500">Kelola anggota Tim Pendamping Keluarga (BKKBN).</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Anggota
        </button>
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Peran</th>
              <th className="px-4 py-3">Posyandu / RW</th>
              <th className="px-4 py-3">No. HP</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan="5" className="text-center py-4">Memuat...</td></tr> : 
              data.map(item => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-bold">{item.nama}</td>
                  <td className="px-4 py-3">{item.peran}</td>
                  <td className="px-4 py-3">{item.posyandu} / {item.rw}</td>
                  <td className="px-4 py-3">{item.no_hp || '-'}</td>
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

      {/* Modal Tambah */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-zinc-50">
              <h3 className="font-bold">Tambah Anggota TPK</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSimpan} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold block mb-1">Nama Lengkap</label>
                <input type="text" className="w-full border rounded-xl px-3 py-2" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Peran dalam Tim</label>
                <select className="w-full border rounded-xl px-3 py-2" value={form.peran} onChange={e => setForm({...form, peran: e.target.value})}>
                  <option>Ketua TPK</option>
                  <option>Bidan Desa</option>
                  <option>Kader KB</option>
                  <option>Kader PKK</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Posyandu</label>
                <select className="w-full border rounded-xl px-3 py-2" value={form.posyandu} onChange={e => setForm({...form, posyandu: e.target.value})}>
                  {POSYANDU_LIST.map(p => <option key={p.id} value={p.nama}>{p.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">No. HP</label>
                <input type="text" className="w-full border rounded-xl px-3 py-2" value={form.no_hp} onChange={e => setForm({...form, no_hp: e.target.value})} />
              </div>
              <button type="submit" disabled={saving} className="w-full bg-emerald-600 text-white py-2 rounded-xl font-bold">
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}