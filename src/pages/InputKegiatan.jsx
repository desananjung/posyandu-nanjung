import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BIDANG, RW_LIST, POSYANDU_LIST } from '../lib/data';
import { useAuth } from '../context/AuthContext';
import { createKegiatan, uploadFoto } from '../lib/api';
import { Save, X, Camera, Loader2 } from 'lucide-react';

export default function InputKegiatan() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Inisialisasi form
  const [form, setForm] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    posyandu: user?.posyandu || POSYANDU_LIST[0].nama,
    rw: user?.rw || POSYANDU_LIST[0].rw,
    bidang: user?.bidang || 'kesehatan',
    sub_bidang: '',
    nama_kegiatan: '',
    sasaran: '',
    hasil: '',
    kendala: '',
    tindak_lanjut: ''
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const bidang = BIDANG.find((b) => b.id === form.bidang);
  const isKader = user?.role === 'kader';

  // Handler saat Posyandu diganti, RW otomatis menyesuaikan
  const handlePosyanduChange = (e) => {
    const selectedId = e.target.value;
    const selectedPos = POSYANDU_LIST.find(p => p.id === selectedId);
    if (selectedPos) {
      setForm({ ...form, posyandu: selectedPos.nama, rw: selectedPos.rw });
    }
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setError('Ukuran foto maksimal 5MB');
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.sub_bidang) return setError('Pilih sub-jenis kegiatan');
    if (!form.nama_kegiatan) return setError('Isi nama kegiatan');
    if (!form.sasaran) return setError('Isi jumlah sasaran');
    if (!form.hasil) return setError('Isi hasil kegiatan');

    setLoading(true);
    try {
      let foto_url = null;
      if (file) {
        foto_url = await uploadFoto(file, user.id);
      }

      await createKegiatan({
        ...form,
        sasaran: Number(form.sasaran),
        foto_url,
        status: 'draft'
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Gagal menyimpan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📝 Input Kegiatan</h1>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-zinc-200 p-5 md:p-6 space-y-5 shadow-sm">
        
        {/* BARIS 1: Tanggal & Bidang */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5">Tanggal Kegiatan</label>
            <input
              type="date"
              value={form.tanggal}
              onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm bg-zinc-50 focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1.5">Bidang SPM</label>
            <select
              value={form.bidang}
              onChange={(e) => setForm({ ...form, bidang: e.target.value, sub_bidang: '' })}
              disabled={isKader && user?.bidang}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm bg-zinc-50 disabled:opacity-60 focus:ring-2 focus:ring-emerald-500"
            >
              {BIDANG.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </div>

        {/* BARIS 2: Posyandu & RW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5">Pilih Posyandu</label>
            <select 
              value={POSYANDU_LIST.find(p => p.nama === form.posyandu)?.id || ''} 
              onChange={handlePosyanduChange}
              disabled={isKader && user?.posyandu}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm bg-zinc-50 disabled:opacity-60 focus:ring-2 focus:ring-emerald-500"
            >
              {POSYANDU_LIST.map((p) => (
                <option key={p.id} value={p.id}>{p.nama} ({p.rw})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1.5">RW (Otomatis)</label>
            <input 
              type="text" 
              value={form.rw} 
              disabled 
              className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm bg-zinc-100 opacity-60 cursor-not-allowed" 
            />
          </div>
        </div>

        {/* BARIS 3: Sub Kegiatan */}
        <div>
          <label className="text-xs font-semibold block mb-1.5">Sub-Jenis Kegiatan</label>
          <select
            value={form.sub_bidang}
            onChange={(e) => setForm({ ...form, sub_bidang: e.target.value })}
            className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm bg-zinc-50 focus:ring-2 focus:ring-emerald-500"
            required
          >
            <option value="">— Pilih sub-jenis —</option>
            {bidang?.subKegiatan.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* BARIS 4: Nama Kegiatan */}
        <div>
          <label className="text-xs font-semibold block mb-1.5">Nama Kegiatan Spesifik</label>
          <input
            value={form.nama_kegiatan}
            onChange={(e) => setForm({ ...form, nama_kegiatan: e.target.value })}
            placeholder="Contoh: Penimbangan Balita Posyandu Melati"
            className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm bg-zinc-50 focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        {/* BARIS 5: Sasaran & Foto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5">Jumlah Sasaran</label>
            <input
              type="number"
              value={form.sasaran}
              onChange={(e) => setForm({ ...form, sasaran: e.target.value })}
              placeholder="42"
              className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm bg-zinc-50 focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1.5">Foto Kegiatan (opsional)</label>
            <label className="w-full rounded-xl border border-dashed border-zinc-300 px-3 py-2.5 text-sm bg-zinc-50 flex items-center justify-between cursor-pointer hover:bg-white transition">
              <span className="flex items-center gap-2 text-zinc-600">
                <Camera className="w-4 h-4" /> {file ? file.name : 'Pilih foto'}
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
          </div>
        </div>

        {/* Preview Foto */}
        {preview && (
          <div className="relative w-full h-48 rounded-xl overflow-hidden border border-zinc-200">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <button type="button" onClick={() => {setFile(null); setPreview(null);}} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* BARIS 6: Hasil */}
        <div>
          <label className="text-xs font-semibold block mb-1.5">Hasil Kegiatan</label>
          <textarea
            rows={3}
            value={form.hasil}
            onChange={(e) => setForm({ ...form, hasil: e.target.value })}
            placeholder="Contoh: 32 balita ditimbang, 2 dirujuk ke Puskesmas..."
            className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm bg-zinc-50 focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        {/* BARIS 7: Kendala & Tindak Lanjut */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5">Kendala</label>
            <textarea
              rows={2}
              value={form.kendala}
              onChange={(e) => setForm({ ...form, kendala: e.target.value })}
              placeholder="Opsional"
              className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm bg-zinc-50 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1.5">Tindak Lanjut</label>
            <textarea
              rows={2}
              value={form.tindak_lanjut}
              onChange={(e) => setForm({ ...form, tindak_lanjut: e.target.value })}
              placeholder="Opsional"
              className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm bg-zinc-50 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex gap-3 pt-4 border-t border-zinc-100">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition shadow-sm"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><Save className="w-4 h-4" /> Simpan Kegiatan</>}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 border border-zinc-200 px-6 py-2.5 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition"
          >
            <X className="w-4 h-4" /> Batal
          </button>
        </div>
      </form>
    </div>
  );
}