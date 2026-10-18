import { Shield, Save } from 'lucide-react';
import { useState } from 'react';
import Toast from '../components/Toast';

export default function Settings() {
  const [toast, setToast] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    setToast({ msg: 'Pengaturan disimpan (Mockup)', type: 'success' });
  };

  return (
    <div className="space-y-6 relative max-w-2xl">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl grid place-items-center">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Pengaturan Desa</h1>
          <p className="text-sm text-zinc-500">Konfigurasi identitas desa pada laporan.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1.5">Nama Desa</label>
            <input type="text" defaultValue="Nanjung" className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm bg-zinc-50" />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1.5">Kecamatan</label>
            <input type="text" defaultValue="Margaasih" className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm bg-zinc-50" />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1.5">Kabupaten</label>
            <input type="text" defaultValue="Bandung" className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm bg-zinc-50" />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1.5">Tahun Anggaran</label>
            <input type="text" defaultValue="2024" className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm bg-zinc-50" />
          </div>
        </div>
        <div className="pt-4 border-t border-zinc-100 flex justify-end">
          <button type="submit" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-bold">
            <Save className="w-4 h-4" /> Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}