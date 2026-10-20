import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { updateKegiatan } from '../lib/api';
import Toast from './Toast';
import { BIDANG } from '../lib/data';

export default function ModalEditKegiatan({ kegiatan, onClose, onRefresh }) {
  const [form, setForm] = useState(kegiatan);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateKegiatan(kegiatan.id, {
        nama_kegiatan: form.nama_kegiatan,
        sasaran: Number(form.sasaran),
        hasil: form.hasil,
        kendala: form.kendala,
        tindak_lanjut: form.tindak_lanjut,
        sub_bidang: form.sub_bidang
      });
      setToast({ msg: 'Kegiatan berhasil diperbarui', type: 'success' });
      setTimeout(() => {
        onRefresh();
        onClose();
      }, 1000);
    } catch (err) {
      setToast({ msg: 'Gagal update: ' + err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
          <h3 className="font-bold text-zinc-900">Edit Kegiatan</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 bg-white rounded-full p-1 shadow-sm">
            <X className="w-5 h-5"/>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">Nama Kegiatan</label>
            <input type="text" value={form.nama_kegiatan} onChange={e => setForm({...form, nama_kegiatan: e.target.value})} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">Jumlah Sasaran</label>
              <input type="number" value={form.sasaran} onChange={e => setForm({...form, sasaran: e.target.value})} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">Sub Kegiatan</label>
              <input type="text" value={form.sub_bidang || ''} onChange={e => setForm({...form, sub_bidang: e.target.value})} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">Hasil</label>
            <textarea value={form.hasil || ''} onChange={e => setForm({...form, hasil: e.target.value})} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" rows="3" required />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">Kendala</label>
            <textarea value={form.kendala || ''} onChange={e => setForm({...form, kendala: e.target.value})} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" rows="2" />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">Tindak Lanjut</label>
            <textarea value={form.tindak_lanjut || ''} onChange={e => setForm({...form, tindak_lanjut: e.target.value})} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" rows="2" />
          </div>
          <div className="pt-4 flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl">Batal</button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}