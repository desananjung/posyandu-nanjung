import { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { UserCog, Plus, X, Save, Loader2, Shield } from 'lucide-react';
import Toast from '../components/Toast';
import { RW_LIST, POSYANDU_LIST } from '../lib/data';
import { supabaseAdminAuth, supabase } from '../lib/supabase';

export default function Users() {
  const { profiles, loading, fetchProfiles, updateRole } = useProfile();
  const [toast, setToast] = useState(null);
  
  // State untuk Modal Tambah User
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    role: 'kader',
    rw: 'RW01',
    posyandu: POSYANDU_LIST[0].nama
  });

  // Fungsi Update Role/RW untuk user yang sudah ada
  const handleSaveRole = async (id, role, rw) => {
    const { error } = await updateRole(id, role, rw);
    if (error) setToast({ msg: 'Gagal update user', type: 'error' });
    else setToast({ msg: 'Data user diperbarui', type: 'success' });
  };

  // Fungsi Tambah User Baru (Kader/Koordinator)
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!form.nama || !form.email || !form.password) {
      return setToast({ msg: 'Semua kolom bertanda bintang wajib diisi', type: 'error' });
    }
    if (form.password.length < 6) {
      return setToast({ msg: 'Password minimal 6 karakter', type: 'error' });
    }

    setSaving(true);
    try {
      // 1. Daftarkan ke Auth Supabase (menggunakan client khusus)
      const { data, error } = await supabaseAdminAuth.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            nama: form.nama,
            role: form.role
          }
        }
      });

      if (error) throw error;

      // 2. Update profilnya dengan RW dan Posyandu (karena trigger hanya membuat nama & role)
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            rw: form.role === 'kader' ? form.rw : null,
            posyandu: form.role === 'kader' ? form.posyandu : null 
          })
          .eq('id', data.user.id);
          
        if (profileError) throw profileError;
      }

      setToast({ msg: `Akun ${form.nama} berhasil dibuat`, type: 'success' });
      setShowModal(false);
      setForm({ nama: '', email: '', password: '', role: 'kader', rw: 'RW01', posyandu: POSYANDU_LIST[0].nama });
      fetchProfiles(); // Refresh tabel
    } catch (err) {
      setToast({ msg: 'Gagal: ' + err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handlePosyanduChange = (e) => {
    const selected = POSYANDU_LIST.find(p => p.nama === e.target.value);
    setForm({ ...form, posyandu: selected.nama, rw: selected.rw });
  };

  return (
    <div className="space-y-6 relative">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl grid place-items-center">
            <UserCog className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Manajemen Pengguna</h1>
            <p className="text-sm text-zinc-500">Atur role, wilayah, dan tambah akun Kader baru.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Pengguna
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Nama / Email</th>
                <th className="px-4 py-3 font-semibold">Role Akses</th>
                <th className="px-4 py-3 font-semibold">Wilayah Tugas</th>
                <th className="px-4 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-8">Memuat...</td></tr>
              ) : (
                profiles.map(p => (
                  <tr key={p.id} className="hover:bg-zinc-50/50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-zinc-900">{p.nama}</div>
                      <div className="text-xs text-zinc-500">{p.email || 'Email terdaftar di Auth'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <select 
                        id={`role-${p.id}`}
                        defaultValue={p.role}
                        className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="kader">Kader</option>
                        <option value="koordinator">Koordinator</option>
                        <option value="admin">Admin Desa</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select 
                        id={`rw-${p.id}`}
                        defaultValue={p.rw || ''}
                        className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Semua RW (Admin/Koord)</option>
                        {RW_LIST.map(rw => <option key={rw} value={rw}>{rw}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => {
                          const role = document.getElementById(`role-${p.id}`).value;
                          const rw = document.getElementById(`rw-${p.id}`).value;
                          handleSaveRole(p.id, role, rw);
                        }}
                        className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition"
                      >
                        Simpan
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Pengguna Baru */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
              <h3 className="font-bold text-zinc-900">Tambah Pengguna Baru</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-700 bg-white rounded-full p-1 shadow-sm">
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Nama Lengkap *</label>
                <input type="text" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500" required />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Password *</label>
                  <input type="text" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500" placeholder="Min. 6 karakter" required />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Role Akses</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500">
                  <option value="kader">Kader Posyandu</option>
                  <option value="koordinator">Koordinator Bidang</option>
                  <option value="admin">Admin Desa</option>
                </select>
              </div>

              {form.role === 'kader' && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-3">
                  <div>
                    <label className="text-xs font-bold text-emerald-800 block mb-1">Pilih Posyandu</label>
                    <select value={form.posyandu} onChange={handlePosyanduChange} className="w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500">
                      {POSYANDU_LIST.map(p => <option key={p.id} value={p.nama}>{p.nama}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-emerald-800 block mb-1">RW (Otomatis)</label>
                    <input type="text" value={form.rw} disabled className="w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm bg-emerald-100/50 opacity-70 cursor-not-allowed" />
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-2 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl transition">Batal</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Buat Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}