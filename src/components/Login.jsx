import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Eye, EyeOff, ArrowRight, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEMO = [
  { email: 'admin@nanjung.local', pass: 'admin123', role: 'Admin Desa' },
  { email: 'koord@nanjung.local', pass: 'koord123', role: 'Koordinator' },
  { email: 'kader01@nanjung.local', pass: 'kader123', role: 'Kader RW03' }
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', showPass: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const online = navigator.onLine;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      return setError('Email dan password wajib diisi');
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F6F7F2] flex items-center justify-center p-4">
      <div className="w-full max-w-[960px] grid md:grid-cols-2 rounded-[24px] overflow-hidden shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)] bg-white">

        {/* PANEL KIRI */}
        <div className="relative bg-[#1A5D1A] text-white p-6 md:p-8 flex flex-col justify-between overflow-hidden min-h-[480px]">
          <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
            <div className="absolute -right-24 -top-24 w-[340px] h-[340px] rounded-full bg-white" />
            <div className="absolute -left-16 -bottom-16 w-[220px] h-[220px] rounded-full bg-[#F4B400]" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white grid place-items-center shadow-sm overflow-hidden p-1">
                <img src="/logo-desa.png" alt="Logo Desa" className="w-full h-full object-contain" />
                </div>
              <div className="leading-tight">
                <div className="font-bold text-[15px]">Desa Nanjung</div>
                <div className="text-[11px] opacity-80 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Margaasih · Kab. Bandung
                </div>
              </div>
            </div>
            <h1 className="text-[32px] md:text-[38px] font-bold leading-[1.05]">
              Dasbor<br />Posyandu 6 SPM
            </h1>
            <p className="text-[12.5px] opacity-85 mt-4 leading-relaxed max-w-[320px]">
              Satu aplikasi untuk Admin Desa, Koordinator Bidang, dan Kader RW.
              Data tersimpan aman di cloud Supabase.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/10 p-3">
                <div className="text-[10px] opacity-70 uppercase tracking-wider font-semibold">Database</div>
                <div className="text-[13px] font-bold mt-0.5">Supabase</div>
                <div className="text-[10px] opacity-70 mt-1">PostgreSQL + Auth + Storage</div>
              </div>
              <div className="rounded-xl bg-[#F4B400] text-black p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider">Multi Dashboard</div>
                <div className="text-[11px] leading-snug mt-1 font-medium">
                  Admin · Koordinator · Kader RW
                </div>
              </div>
            </div>
          </div>
          <div className="relative text-[10px] opacity-60 mt-8">
            © 2026 Pemerintah Desa Nanjung · v3.0
          </div>
        </div>

        {/* PANEL KANAN */}
        <div className="p-6 md:p-8 bg-white flex flex-col">
          <div className="flex items-center justify-between mb-6 gap-3">
            <h2 className="text-[20px] md:text-[22px] font-bold text-[#1A2E1A]">
              Masuk ke Dasbor
            </h2>
            <span className={`text-[10.5px] px-2.5 py-1 rounded-full border font-medium inline-flex items-center gap-1.5 ${
              online ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              {online ? <><Wifi className="w-3 h-3" /> Online</> : <><WifiOff className="w-3 h-3" /> Offline</>}
            </span>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-[12px] rounded-xl p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#1A2E1A] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@nanjung.local"
                autoComplete="email"
                autoFocus
                className="w-full rounded-xl border border-[#E9EDE4] bg-[#F6F7F2] px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1A5D1A]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#1A2E1A] mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={form.showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-[#E9EDE4] bg-[#F6F7F2] px-3.5 py-2.5 pr-10 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1A5D1A]"
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, showPass: !form.showPass })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-[#E9EDE4] text-[#6B7D6B]"
                >
                  {form.showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A5D1A] hover:bg-[#123F12] disabled:opacity-60 text-white py-3 rounded-xl font-bold text-[13.5px] transition flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</> : <>Masuk <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-5">
            <div className="text-[11px] font-semibold text-[#6B7D6B] mb-2">Akun demo:</div>
            <div className="space-y-2">
              {DEMO.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => setForm({ ...form, email: d.email, password: d.pass })}
                  className={`w-full text-left rounded-xl border p-2.5 transition ${
                    form.email === d.email ? 'bg-[#E8F5E9] border-[#1A5D1A]' : 'bg-[#F6F7F2] border-[#E9EDE4] hover:bg-white'
                  }`}
                >
                  <div className="text-[11px] font-bold text-[#1A2E1A]">{d.role}</div>
                  <div className="text-[10px] text-[#6B7D6B] font-mono mt-0.5">
                    {d.email} / {d.pass}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-5">
            <div className="text-[10.5px] text-[#6B7D6B] bg-[#F6F7F2] border border-[#E9EDE4] rounded-xl p-3">
              <strong className="text-[#1A2E1A]">Catatan:</strong> Login akan mengarahkan Anda
              ke dashboard sesuai peran. Kader RW hanya melihat data RW-nya.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}