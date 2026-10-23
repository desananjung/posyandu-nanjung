import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { uploadFoto } from '../lib/api';
import { Save, X, Camera, Loader2 } from 'lucide-react';
import Toast from '../components/Toast';

export default function FormTPK() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    nama_keluarga: '',
    kategori_sasaran: 'Ibu Hamil',
    nik: '',
    alamat: '',
    intervensi: '',
    kendala: '',
    tindak_lanjut: ''
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(f);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama_keluarga) return setToast({ msg: 'Nama Keluarga wajib diisi', type: 'error' });

    setSaving(true);
    try {
      let foto_url = null;
      if (file) {
        foto_url = await uploadFoto(file, user.id);
      }

      const { error } = await supabase.from('pendampingan_tpk').insert([{
        ...form,
        posyandu: user.posyandu,
        rw: user.rw,
        foto_url,
        created_by: user.id
      }]);

      if (error) throw error;
      
      setToast({ msg: 'Data pendampingan TPK berhasil disimpan', type: 'success' });
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setToast({ msg: 'Gagal menyimpan: ' + err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto relative">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">🤝 Form Pendampingan TPK</h1>
        <p className="text-sm text-zinc-500">Catat hasil pendampingan keluarga oleh Tim Pendamping Keluarga (BKKBN).</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-zinc-200 p-5 md:p-6 space-y-5 shadow-sm">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5">Tanggal Pendampingan</label>
            <input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm bg-zinc-50" required />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1.5">Kategori Sasaran</label>
            <select value={form.kategori_sasaran} onChange={(e) => setForm({ ...form, kategori_sasaran: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm bg-zinc-50">
              <option value="Catin">Calon Pengantin (Catin)</option>
              <option value="Ibu Hamil">Ibu Hamil</option>
              <option value="Baduta">Baduta (0-23 Bulan)</option>
              <option value="Balita">Balita (24-59 Bulan)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold block mb-1.5">Nama Keluarga / Kepala Keluarga</label>
          <input type="text" value={form.nama_keluarga} onChange={(e) => setForm({ ...form, nama_keluarga: e.target.value })} placeholder="Contoh: Keluarga Bpk. Budi" className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm bg-zinc-50" required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5">NIK (Opsional)</label>
            <input type="text" maxLength={16} value={form.nik} onChange={(e) => setForm({ ...form, nik: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm bg-zinc-50" />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1.5">Alamat / RT / RW</label>
            <input type="text" value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm bg-zinc-50" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold block mb-1.5">Bentuk Intervensi / Pendampingan</label>
          <textarea rows={3} value={form.intervensi} onChange={(e) => setForm({ ...form, intervensi: e.target.value })} placeholder="Contoh: Penyuluhan gizi, pemberian PMT, rujukan ke Puskesmas..." className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm bg-zinc-50" required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5">Kendala</label>
            <textarea rows={2} value={form.kendala} onChange={(e) => setForm({ ...form, kendala: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm bg-zinc-50" />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1.5">Tindak Lanjut</label>
            <textarea rows={2} value={form.tindak_lanjut} onChange={(e) => setForm({ ...form, tindak_lanjut: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm bg-zinc-50" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold block mb-1.5">Foto Kegiatan (Opsional)</label>
          <label className="w-full rounded-xl border border-dashed border-zinc-300 px-3 py-2.5 text-sm bg-zinc-50 flex items-center justify-between cursor-pointer hover:bg-white transition">
            <span className="flex items-center gap-2 text-zinc-600">
              <Camera className="w-4 h-4" /> {file ? file.name : 'Pilih foto'}
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        </div>

        {preview && (
          <div className="relative w-full h-48 rounded-xl overflow-hidden border border-zinc-200">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <button type="button" onClick={() => {setFile(null); setPreview(null);}} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-zinc-100">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><Save className="w-4 h-4" /> Simpan Data TPK</>}
          </button>
          <button type="button" onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 border border-zinc-200 px-6 py-2.5 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition">
            <X className="w-4 h-4" /> Batal
          </button>
        </div>
      </form>
    </div>
  );
}