import { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { UserCog, Plus, X, Save, Loader2, Edit, Trash2 } from 'lucide-react';
import Toast from '../components/Toast';
import { RW_LIST, POSYANDU_LIST, JABATAN_LIST } from '../lib/data';
import { supabaseAdminAuth, supabase } from '../lib/supabase';
import { updateUserProfile, deleteUserProfile } from '../lib/api';

export default function Users() {
  const { profiles, loading, fetchProfiles } = useProfile();
  const [toast, setToast] = useState(null);
  
  // State Modal Tambah/Edit
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null); // Jika ada ID, berarti mode Edit
  const [saving, setSaving] = useState(false);
  
  const initialForm = {
    nama: '', email: '', password: '', role: 'kader', 
    rw: 'RW01', posyandu: POSYANDU_LIST[0].nama, jabatan: 'Ketua Posyandu'
  };
  const [form, setForm] = useState(initialForm);

  // Buka Modal Tambah
  const handleOpenTambah = () => {
    setEditId(null);
    setForm(initialForm);
    setShowModal(true);
  };

  // Buka Modal Edit
  const handleOpenEdit = (user) => {
    setEditId(user.id);
    setForm({
      nama: user.nama || '',
      email: user.email || '', // Email mungkin tidak tampil jika dari auth
      password: '', // Biarkan kosong jika tidak ingin ganti password
      role: user.role || 'kader',
      rw: user.rw || 'RW01',
      posyandu: user.posyandu || POSYANDU_LIST[0].nama,
      jabatan: user.jabatan || 'Ketua Posyandu'
    });
    setShowModal(true);
  };

  // Simpan (Tambah / Edit)
  const handleSimpan = async (e) => {
    e.preventDefault();
    if (!form.nama) return setToast({ msg: 'Nama wajib diisi', type: 'error' });

    setSaving(true);
    try {
      if (editId) {
        // Mode Edit: Hanya update profil
        await updateUserProfile(editId, {
          nama: form.nama,
          role: form.role,
          rw: form.role === 'kader' ? form.rw : null,
          posyandu: form.role === 'kader' ? form.posyandu : null,
          jabatan: form.role === 'kader' ? form.jabatan : null
        });
        setToast({ msg: 'Profil user diperbarui', type: 'success' });
      } else {
        // Mode Tambah: Daftarkan ke Auth Supabase dulu
        if (!form.email || !form.password) throw new Error('Email dan Password wajib diisi untuk user baru');
        if (form.password.length < 6) throw new Error('Password minimal 6 karakter');

        const { data, error } = await supabaseAdminAuth.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { nama: form.nama, role: form.role } }
        });
        if (error) throw error;

        // Update profil dengan data tambahan
        if (data.user) {
          await updateUserProfile(data.user.id, {
            rw: form.role === 'kader' ? form.rw : null,
            posyandu: form.role === 'kader' ? form.posyandu : null,
            jabatan: form.role === 'kader' ? form.jabatan : null
          });
        }
        setToast({ msg: `Akun ${form.nama} berhasil dibuat`, type: 'success' });
      }
      
      setShowModal(false);
      fetchProfiles();
    } catch (err) {
      setToast({ msg: 'Gagal: ' + err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Hapus User
  const handleHapus = async (id, nama) => {
    if (!window.confirm(`Yakin ingin menghapus user "${nama}"? User ini tidak akan bisa login lagi.`)) return;
    try {
      await deleteUserProfile(id);
      setToast({ msg: 'User berhasil dihapus (dinonaktifkan)', type: 'success' });
      fetchProfiles();
    } catch (err) {
      setToast({ msg: 'Gagal menghapus: ' + err.message, type: 'error' });
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
            <p className="text-sm text-zinc-500">Atur role, wilayah, dan jabatan struktural.</p>
          </div>
        </div>
        <button 
          onClick={handleOpenTambah}
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
                <th className="px-4 py-3 font-semibold">Role & Jabatan</th>
                <th className="px-4 py-3 font-semibold">Wilayah Tugas</th>
                <th className="px-4 py-3 font-semibold text-center">Aksi</th>
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
                      <div className="font-semibold capitalize">{p.role}</div>
                      <div className="text-[11px] text-emerald-600 font-bold">{p.jabatan || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{p.posyandu || 'Semua Posyandu'}</div>
                      <div className="text-[11px] text-zinc-500">{p.rw || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleOpenEdit(p)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Edit User">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleHapus(p.id, p.nama)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Hapus User">
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

      {/* MODAL TAMBAH / EDIT USER */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
              <h3 className="font-bold text-zinc-900">{editId ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-700 bg-white rounded-full p-1 shadow-sm">
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <form onSubmit={handleSimpan} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Nama Lengkap *</label>
                <input type="text" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500" required />
              </div>
              
              {/* Email & Password hanya muncul saat TAMBAH user baru */}
              {!editId && (
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
              )}

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
                    <label className="text-xs font-bold text-emerald-800 block mb-1">Jabatan Struktural</label>
                    <select value={form.jabatan} onChange={e => setForm({...form, jabatan: e.target.value})} className="w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500">
                      {JABATAN_LIST.map(j => <option key={j} value={j}>{j}</option>)}
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