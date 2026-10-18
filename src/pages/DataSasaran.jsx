import { useState } from 'react';
import { Search, Plus, Trash2, X, Save, Loader2 } from 'lucide-react';
import { useSasaran } from '../hooks/useSasaran';
import { BIDANG, RW_LIST, POSYANDU_LIST } from '../lib/data'; // Tambah POSYANDU_LIST
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

export default function DataSasaran() {
  const { user } = useAuth();
  const [filterBidang, setFilterBidang] = useState('');
  const [filterRW, setFilterRW] = useState('');
  const [filterPosyandu, setFilterPosyandu] = useState('');
  
  // Ambil data dari hook (pastikan hook useSasaran Anda mendukung parameter ke-3 atau abaikan)
  const { sasaran, loading, fetchSasaran } = useSasaran(filterBidang, filterRW);
  
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  
  // State form tambah sasaran
  const [form, setForm] = useState({
    nama: '', 
    kategori: '', 
    bidang: 'kesehatan', 
    rw: user?.rw || 'RW01', 
    posyandu: user?.posyandu || POSYANDU_LIST[0].nama,
    jenis_kelamin: 'L'
  });
  const [saving, setSaving] = useState(false);

  // Gabungkan semua filter (Search, Bidang, RW, Posyandu)
  const filteredData = sasaran.filter(s => {
    const matchSearch = s.nama.toLowerCase().includes(search.toLowerCase());
    const matchBidang = filterBidang ? s.bidang === filterBidang : true;
    const matchRW = filterRW ? s.rw === filterRW : true;
    const matchPosyandu = filterPosyandu ? s.posyandu === filterPosyandu : true;
    return matchSearch && matchBidang && matchRW && matchPosyandu;
  });

  const handleTambah = async (e) => {
    e.preventDefault();
    if (!form.nama || !form.kategori) {
      return setToast({ msg: 'Nama dan Kategori wajib diisi', type: 'error' });
    }

    setSaving(true);
    const { error } = await supabase.from('sasaran').insert([{
      ...form,
      created_by: user.id
    }]);

    if (error) {
      setToast({ msg: 'Gagal menyimpan: ' + error.message, type: 'error' });
    } else {
      setToast({ msg: 'Data sasaran berhasil ditambahkan', type: 'success' });
      setShowModal(false);
      setForm({ 
        nama: '', kategori: '', bidang: 'kesehatan', 
        rw: user?.rw || 'RW01', posyandu: user?.posyandu || POSYANDU_LIST[0].nama, jenis_kelamin: 'L' 
      });
      fetchSasaran(); // Refresh tabel
    }
    setSaving(false);
  };

  const handleHapus = async (id) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    
    // Soft delete (ubah status aktif jadi false)
    const { error } = await supabase.from('sasaran').update({ aktif: false }).eq('id', id);
    
    if (!error) {
      setToast({ msg: 'Data berhasil dihapus', type: 'info' });
      fetchSasaran();
    }
  };

  // Fungsi untuk sinkronisasi RW saat Posyandu diganti di form
  const handlePosyanduFormChange = (e) => {
    const selected = POSYANDU_LIST.find(p => p.nama === e.target.value);
    setForm({ ...form, posyandu: selected.nama, rw: selected.rw });
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
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Sasaran
        </button>
      </div>

      {/* Filter & Search Box */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex flex-col lg:flex-row gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari nama sasaran..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        
        {/* Dropdown Filters */}
        <div className="flex flex-wrap gap-2">
          <select value={filterBidang} onChange={e => setFilterBidang(e.target.value)} className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500">
            <option value="">Semua Bidang</option>
            {BIDANG.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          
          <select value={filterPosyandu} onChange={e => setFilterPosyandu(e.target.value)} className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500">
            <option value="">Semua Posyandu</option>
            {POSYANDU_LIST.map(p => <option key={p.id} value={p.nama}>{p.nama}</option>)}
          </select>

          <select value={filterRW} onChange={e => setFilterRW(e.target.value)} className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500" disabled={user?.role === 'kader'}>
            <option value="">Semua RW</option>
            {RW_LIST.map(rw => <option key={rw} value={rw}>{rw}</option>)}
          </select>
        </div>
      </div>

      {/* Tabel Data */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Nama</th>
                <th className="px-4 py-3 font-semibold">Kategori</th>
                <th className="px-4 py-3 font-semibold">Bidang</th>
                <th className="px-4 py-3 font-semibold">Posyandu / RW</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8">Memuat data...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-zinc-500">Belum ada data sasaran yang cocok.</td></tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50 transition">
                    <td className="px-4 py-3 font-medium text-zinc-900">{item.nama}</td>
                    <td className="px-4 py-3 text-zinc-600">{item.kategori}</td>
                    <td className="px-4 py-3 text-zinc-600 capitalize">{item.bidang.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-zinc-600">
                      <div className="font-semibold text-xs">{item.posyandu || '-'}</div>
                      <div className="text-[10px] text-zinc-400">{item.rw}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleHapus(item.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Hapus Data">
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

      {/* Modal Tambah Data */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
              <h3 className="font-bold text-zinc-900">Tambah Sasaran Baru</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-700 bg-white rounded-full p-1 shadow-sm">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <form onSubmit={handleTambah} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Nama Lengkap</label>
                <input type="text" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500" placeholder="Cth: Budi Santoso" required />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Kategori</label>
                <input type="text" value={form.kategori} onChange={e => setForm({...form, kategori: e.target.value})} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500" placeholder="Cth: Balita, Ibu Hamil, Lansia" required />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Bidang</label>
                <select value={form.bidang} onChange={e => setForm({...form, bidang: e.target.value})} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500">
                  {BIDANG.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Posyandu</label>
                  <select value={form.posyandu} onChange={handlePosyanduFormChange} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500" disabled={user?.role === 'kader'}>
                    {POSYANDU_LIST.map(p => <option key={p.id} value={p.nama}>{p.nama}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">RW (Otomatis)</label>
                  <input type="text" value={form.rw} disabled className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm bg-zinc-100 opacity-70 cursor-not-allowed" />
                </div>
              </div>

              <div className="pt-4 flex gap-2 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl transition">Batal</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition">
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