import { useState } from 'react';
import { Shield, Save, Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import Toast from '../components/Toast';
import { backupDataKeExcel, backupDataKeCSV } from '../lib/api';

export default function Settings() {
  const [toast, setToast] = useState(null);
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [loadingCSV, setLoadingCSV] = useState(false);

  // Fungsi Backup Excel
  const handleBackupExcel = async () => {
    setLoadingBackup(true);
    try {
      await backupDataKeExcel();
      setToast({ msg: 'File Excel berhasil diunduh', type: 'success' });
    } catch (err) {
      setToast({ msg: 'Gagal backup Excel: ' + err.message, type: 'error' });
    } finally {
      setLoadingBackup(false);
    }
  };

  // Fungsi Backup CSV
  const handleBackupCSV = async () => {
    setLoadingCSV(true);
    try {
      await backupDataKeCSV();
      setToast({ msg: 'File CSV berhasil diunduh', type: 'success' });
    } catch (err) {
      setToast({ msg: 'Gagal backup CSV: ' + err.message, type: 'error' });
    } finally {
      setLoadingCSV(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setToast({ msg: 'Pengaturan disimpan', type: 'success' });
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
          <p className="text-sm text-zinc-500">Konfigurasi identitas desa dan pencadangan data.</p>
        </div>
      </div>

      {/* TOMBOL BACKUP DATA */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-zinc-900 mb-2">Pencadangan Data (Backup)</h3>
        <p className="text-sm text-zinc-500 mb-4">
          Unduh seluruh data aplikasi dalam bentuk file Excel atau CSV. 
          Lakukan backup secara rutin (misal: seminggu sekali) untuk menghindari kehilangan data.
        </p>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleBackupExcel} 
            disabled={loadingBackup}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition disabled:opacity-60"
          >
            {loadingBackup ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} 
            Unduh Backup Excel
          </button>

          <button 
            onClick={handleBackupCSV} 
            disabled={loadingCSV}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition disabled:opacity-60"
          >
            {loadingCSV ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />} 
            Unduh Backup CSV
          </button>
        </div>
      </div>

      {/* FORM PENGATURAN LAINNYA */}
      <form onSubmit={handleSave} className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1.5">Nama Desa</label>
            <input type="text" defaultValue="Nanjung" className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm bg-zinc-50" />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1.5">Kecamatan</label>
            <input type="text" defaultValue="Margaasih" className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm bg-zinc-50" />
          </div>
        </div>
        <div className="pt-4 border-t border-zinc-100 flex justify-end">
          <button type="submit" className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-900 text-white px-5 py-2 rounded-xl text-sm font-bold transition">
            <Save className="w-4 h-4" /> Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}