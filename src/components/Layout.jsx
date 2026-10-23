import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, ClipboardList, Users, ListTodo, FileBarChart, 
  UserCog, Settings2, LogOut, Menu, X, MapPin, Home, HeartPulse, HeartHandshake, BookOpen
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Definisi Menu berdasarkan Role
  const MENUS = {
    admin: [
      { path: '/dashboard', label: 'Dashboard Admin', icon: LayoutDashboard },
      { path: '/input', label: 'Input Kegiatan', icon: ClipboardList },
      { path: '/sasaran', label: 'Data Sasaran', icon: Users },
      { path: '/monitoring', label: 'Monitoring', icon: ListTodo },
      { path: '/laporan', label: 'Laporan', icon: FileBarChart },
      { path: '/users', label: 'Manajemen User', icon: UserCog },
      { path: '/settings', label: 'Pengaturan', icon: Settings2 },
      { path: '/laporan-tpk', label: 'Laporan TPK', icon: HeartPulse }, // Gunakan HeartPulse
      { path: '/tim-tpk', label: 'Data Tim TPK', icon: Users },
      { path: '/log-kunjungan', label: 'Log Kunjungan TPK', icon: ClipboardList },
      { path: '/laporan-bunda-paud', label: 'Laporan Bunda PAUD', icon: BookOpen },
      { path: '/bunda-paud', label: 'Bunda PAUD', icon: BookOpen },
    ],
    koordinator: [
      { path: '/dashboard', label: 'Dashboard Koordinator', icon: LayoutDashboard },
      { path: '/input', label: 'Input Kegiatan', icon: ClipboardList },
      { path: '/sasaran', label: 'Data Sasaran', icon: Users },
      { path: '/monitoring', label: 'Monitoring', icon: ListTodo },
      { path: '/laporan', label: 'Laporan', icon: FileBarChart },
      { path: '/tim-tpk', label: 'Data Tim TPK', icon: Users },
      { path: '/log-kunjungan', label: 'Log Kunjungan TPK', icon: ClipboardList },
      { path: '/laporan-bunda-paud', label: 'Laporan Bunda PAUD', icon: BookOpen },
    ],
    kader: [
      { path: '/dashboard', label: 'Dashboard Kader', icon: Home },
      { path: '/input', label: 'Input Cepat', icon: ClipboardList },
      { path: '/sasaran', label: 'Sasaran RW Saya', icon: Users },
      { path: '/tpk', label: 'Form Pendampingan TPK', icon: HeartHandshake }, // Gunakan icon yang relevan
      { path: '/laporan-tpk', label: 'Laporan TPK', icon: HeartPulse }, // Gunakan HeartPulse
      { path: '/log-kunjungan', label: 'Log Kunjungan TPK', icon: ClipboardList },
      { path: '/bunda-paud', label: 'Form Bunda PAUD', icon: BookOpen },
      
    ],
  };

  const currentMenu = MENUS[user?.role] || [];

  return (
    <div className="min-h-screen bg-[#F6F7F2] flex">
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 z-50 w-64 h-screen bg-white border-r border-zinc-200 flex flex-col transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 grid place-items-center overflow-hidden p-1 shadow-sm">
            <img src="/logo-desa.png" alt="Logo Desa" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="font-bold text-sm text-zinc-900">Posyandu 6 SPM</div>
              <div className="text-[11px] text-zinc-500">Desa Nanjung</div>
            </div>
          </div>
          <button className="md:hidden text-zinc-500" onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="mb-6 p-3 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-700 text-white grid place-items-center text-sm font-bold shrink-0">
              {user?.nama?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-zinc-900 truncate">{user?.nama}</div>
              <div className="text-[11px] text-zinc-500 capitalize">
                {user?.role} {user?.rw ? `· ${user.rw}` : ''}
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {currentMenu.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive ? 'bg-emerald-700 text-white' : 'text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keluar Akun
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden bg-white border-b border-zinc-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="font-bold text-zinc-900">Posyandu 6 SPM</div>
          <button onClick={() => setIsOpen(true)} className="p-2 bg-zinc-50 rounded-lg">
            <Menu className="w-5 h-5 text-zinc-600" />
          </button>
        </header>

        <div className="p-4 md:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}