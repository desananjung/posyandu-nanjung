import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, ClipboardList, Users, ListTodo, FileBarChart, 
  UserCog, Settings2, LogOut, Menu, X, MapPin, Home, HeartPulse, HeartHandshake, BookOpen, Flower2
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
      { path: '/laporan', label: 'Laporan 6 SPM', icon: FileBarChart },
      { path: '/users', label: 'Manajemen User', icon: UserCog },
      { path: '/settings', label: 'Pengaturan', icon: Settings2 },
      { path: '/laporan-tpk', label: 'Laporan TPK', icon: HeartPulse },
      { path: '/tim-tpk', label: 'Data Tim TPK', icon: Users },
      { path: '/log-kunjungan', label: 'Log Kunjungan TPK', icon: ClipboardList },
      { path: '/laporan-bunda-paud', label: 'Laporan Bunda PAUD', icon: BookOpen },
      { path: '/bunda-paud', label: 'Bunda PAUD', icon: BookOpen },
      { path: '/literasi', label: 'Form Literasi', icon: BookOpen },
      { path: '/laporan-literasi', label: 'Laporan Literasi', icon: BookOpen },
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
      { path: '/laporan-literasi', label: 'Laporan Literasi', icon: BookOpen },
    ],
    kader: [
      { path: '/dashboard', label: 'Dashboard Kader', icon: Home },
      { path: '/input', label: 'Input Cepat', icon: ClipboardList },
      { path: '/sasaran', label: 'Sasaran RW Saya', icon: Users },
      { path: '/tpk', label: 'Form Pendampingan TPK', icon: HeartHandshake },
      { path: '/laporan-tpk', label: 'Laporan TPK', icon: HeartPulse },
      { path: '/log-kunjungan', label: 'Log Kunjungan TPK', icon: ClipboardList },
      { path: '/bunda-paud', label: 'Form Bunda PAUD', icon: BookOpen },
      { path: '/literasi', label: 'Form Literasi', icon: BookOpen },
    ],
  };

  const currentMenu = MENUS[user?.role] || [];

  return (
    <div className="min-h-screen bg-[var(--bg)] flex">
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 z-50 w-64 h-screen bg-[var(--surface)] border-r border-[var(--border)] flex flex-col transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[var(--border)] grid place-items-center overflow-hidden p-1 shadow-sm">
              <img src="/logo-desa.png" alt="Logo Desa" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="font-bold text-sm text-[var(--primary)]">SiCantik</div>
              <div className="text-[11px] text-[var(--text-muted)]">Desa Nanjung</div>
            </div>
          </div>
          <button className="md:hidden text-[var(--text-muted)]" onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="mb-6 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center gap-3">
            {/* Avatar Profil diubah menjadi Pink/Ungu */}
            <div className="w-9 h-9 rounded-full bg-[var(--accent)] text-white grid place-items-center text-sm font-bold shrink-0 shadow-sm">
              {user?.nama?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-[var(--text)] truncate">{user?.nama}</div>
              <div className="text-[11px] text-[var(--text-muted)] capitalize">
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
                    isActive 
                      ? 'bg-[var(--primary)] text-white shadow-sm' 
                      : 'text-[var(--text-muted)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-[var(--border)]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-semibold text-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keluar Akun
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden bg-[var(--surface)] border-b border-[var(--border)] p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="font-bold text-[var(--primary)]">SiCantik</div>
          <button onClick={() => setIsOpen(true)} className="p-2 bg-[var(--surface-2)] rounded-lg">
            <Menu className="w-5 h-5 text-[var(--text)]" />
          </button>
        </header>

        <div className="p-4 md:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}