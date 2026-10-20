import { useState } from 'react';
import { Search, Plus, Trash2, X, Save, Loader2, Edit } from 'lucide-react';
import { useSasaran } from '../hooks/useSasaran';
import { BIDANG, RW_LIST, POSYANDU_LIST } from '../lib/data';
import { supabase, /* import fungsi update/delete jika ada */ } from '../lib/supabase';
import { updateSasaran, deleteSasaran } from '../lib/api'; // Pastikan di-export dari api.js
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

export default function DataSasaran() {
  const { user } = useAuth();
  const [filterBidang, setFilterBidang] = useState('');
  const [filterRW, setFilterRW] = useState('');
  const [filterPosyandu, setFilterPosyandu] = useState('');
  
  const { sasaran, loading, fetchSasaran } = useSasaran(filterBidang, filterRW);
  
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null); // Jika ada ID, berarti mode Edit
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  // State Form Lengkap
  const initialForm = {
    nama: '', nik: '', alamat: '', jenis_kelamin: 'L', tanggal_lahir: '',
    kategori: 'Balita', bidang: 'kesehatan', rw: user?.rw || 'RW01', 
    posyandu: user?.posyandu || POSYANDU_LIST[0].nama, no_hp: ''
  };
  const [form, setForm] = useState(initialForm);

  const filteredData = sasaran.filter(s => {
    const matchSearch = s.nama.toLowerCase().includes(search.toLowerCase()) || (s.nik && s.nik.includes(search));
    const matchBidang = filterBidang ? s.bidang === filterBidang : true;
    const matchRW = filterRW ? s.rw === filterRW : true;
    const matchPosyandu = filterPosyandu ? s.posyandu === filterPosyandu : true;
    return matchSearch && matchBidang && matchRW && matchPosyandu;
  });

  const handleOpenModal = (data = null) => {
    if (data) {
      setEditId(data.id);
      setForm({
        nama: data.nama || '', nik: data.nik || '', alamat: data.alamat || '',
        jenis_kelamin: data.jenis_kelamin || 'L', tanggal_lahir: data.tanggal_lahir || '',
        kategori: data.kategori || 'Balita', bidang: data.bidang || 'kesehatan',
        rw: data.rw || 'RW01', posyandu: data.posyandu || POSYANDU_LIST[0].nama, no_hp: data.no_hp || ''
      });
    } else {
      setEditId(null);
      setForm(initialForm);
    }
    setShowModal(true);
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    if (!form.nama || !form.kategori) return setToast({ msg: 'Nama dan Kategori wajib diisi', type: 'error' });
    
    // Validasi panjang NIK jika diisi
    if (form.nik && form.nik.length !== 16) return setToast({ msg: 'NIK harus 16 digit', type: 'error' });

    setSaving(true);
    try {
      if (editId) {
        // Mode Edit
        await updateSasaran(editId, { ...form, created_by: user.id });
        setToast({ msg: 'Data sasaran berhasil diperbarui', type: 'success' });
      } else {
        // Mode Tambah
        const { error } = await supabase.from('sasaran').insert([{ ...form, created_by: user.id }]);
        if (error) throw error;
        setToast({ msg: 'Data sasaran berhasil ditambahkan', type: 'success' });
      }
      setShowModal(false);
      fetchSasaran();
    } catch (err) {
      setToast({ msg: 'Gagal: ' + err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleHapus = async (id) => {
    if (!confirm('Yakin ingin menghapus data sasaran ini secara permanen?')) return;
    try {
      await deleteSasaran(id);
      setToast({ msg: 'Data berhasil dihapus', type: 'info' });
      fetchSasaran();
    } catch (err) {
      setToast({ msg: 'Gagal menghapus: ' + err.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-4 relative">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Data Sasaran</h1>
          <p className="text-sm text-zinc-500">Kelola data penerima manfaat Posyandu.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Sasaran
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="text" placeholder="Cari nama atau NIK..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={filterBidang} onChange={e => setFilterBidang(e.target.value)} className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm">
            <option value="">Semua Bidang</option>
            {BIDANG.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select value={filterPosyandu} onChange={e => setFilterPosyandu(e.target.value)} className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm">
            <option value="">Semua Posyandu</option>
            {POSYANDU_LIST.map(p => <option key={p.id} value={p.nama}>{p.nama}</option>)}
          </select>
          <select value={filterRW} onChange={e => setFilterRW(e.target.value)} className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm" disabled={user?.role === 'kader'}>
            <option value="">Semua RW</option>
            {RW_LIST.map(rw => <option key={rw} value={rw}>{rw}</option>)}
          </select>
        </div>
      </div>

      {/* Tabel Data */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Nama / NIK</th>
                <th className="px-4 py-3 font-semibold">Alamat (RW)</th>
                <th className="px-4 py-3 font-semibold">L/P</th>
                <th className="px-4 py-3 font-semibold">Tgl Lahir</th>
                <th className="px-4 py-3 font-semibold">Kategori / Posyandu</th>
                <th className="px-4 py-3 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8">Memuat data...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-zinc-500">Belum ada data sasaran.</td></tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-zinc-900">{item.nama}</div>
                      <div className="text-[11px] text-zinc-500">{item.nik || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-zinc-700">{item.alamat || '-'}</div>
                      <div className="text-[11px] text-zinc-500 font-bold">{item.rw}</div>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{item.jenis_kelamin}</td>
                    <td className="px-4 py-3 text-zinc-600">{item.tanggal_lahir || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-bold text-emerald-700">{item.kategori}</div>
                      <div className="text-[11px] text-zinc-500">{item.posyandu}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleOpenModal(item)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleHapus(item.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form (Tambah & Edit) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
              <h3 className="font-bold text-zinc-900">{editId ? 'Edit Data Sasaran' : 'Tambah Sasaran Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-700"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSimpan} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[80vh] overflow-y-auto">
              
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-zinc-700 block mb-1">Nama Lengkap *</label>
                <input type="text" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" required />
              </div>
              
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">NIK / No. KTP (16 Digit)</label>
                <input type="text" maxLength={16} value={form.nik} onChange={e => setForm({...form, nik: e.target.value})} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">No. HP</label>
                <input type="text" value={form.no_hp} onChange={e => setForm({...form, no_hp: e.target.value})} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-zinc-700 block mb-1">Alamat Lengkap (RT/RW/Dusun)</label>
                <input type="text" value={form.alamat} onChange={e => setForm({...form, alamat: e.target.value})} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Jenis Kelamin</label>
                <select value={form.jenis_kelamin} onChange={e => setForm({...form, jenis_kelamin: e.target.value})} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm">
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Tanggal Lahir</label>
                <input type="date" value={form.tanggal_lahir} onChange={e => setForm({...form, tanggal_lahir: e.target.value})} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Kategori Siklus Hidup</label>
                <select value={form.kategori} onChange={e => setForm({...form, kategori: e.target.value})} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm">
                  <option value="Ibu Hamil">Ibu Hamil</option>
                  <option value="Balita">Balita</option>
                  <option value="Anak Sekolah">Anak Sekolah</option>
                  <option value="Remaja">Remaja</option>
                  <option value="Dewasa">Dewasa</option>
                  <option value="Lansia">Lansia</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Bidang SPM</label>
                <select value={form.bidang} onChange={e => setForm({...form, bidang: e.target.value})} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm">
                  {BIDANG.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Pilih Posyandu</label>
                <select 
                  value={POSYANDU_LIST.find(p => p.nama === form.posyandu)?.id || ''} 
                  onChange={(e) => {
                    const selected = POSYANDU_LIST.find(p => p.id === e.target.value);
                    if (selected) setForm(prev => ({ ...prev, posyandu: selected.nama, rw: selected.rw }));
                  }} 
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
                >
                  {POSYANDU_LIST.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">RW (Otomatis)</label>
                <input type="text" value={form.rw} disabled className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm bg-zinc-100" />
              </div>

              <div className="md:col-span-2 pt-4 flex gap-2 justify-end border-t border-zinc-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl">Batal</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}