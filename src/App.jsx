import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import InstallPWA from './components/InstallPWA';
import SyncStatus from './components/SyncStatus';

import DashboardAdmin from './pages/DashboardAdmin';
import DashboardKoordinator from './pages/DashboardKoordinator';
import DashboardKader from './pages/DashboardKader';

import InputKegiatan from './pages/InputKegiatan';
import DataSasaran from './pages/DataSasaran';
import Monitoring from './pages/Monitoring';
import Laporan from './pages/Laporan';
import LaporanKader from './pages/LaporanKader'; // <-- Pastikan ini di-import
import Users from './pages/Users';
import Settings from './pages/Settings';
import FormTPK from './pages/FormTPK';
import LaporanTPK from './pages/LaporanTPK';

function Protected({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Layout>{children}</Layout>;
}

function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === 'admin') return <DashboardAdmin />;
  if (user.role === 'koordinator') return <DashboardKoordinator />;
  return <DashboardKader />;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/dashboard" element={<Protected><DashboardRouter /></Protected>} />
        <Route path="/input" element={<Protected><InputKegiatan /></Protected>} />
        <Route path="/sasaran" element={<Protected><DataSasaran /></Protected>} />
        <Route path="/monitoring" element={<Protected roles={['admin', 'koordinator']}><Monitoring /></Protected>} />
        <Route path="/laporan" element={<Protected roles={['admin', 'koordinator']}><Laporan /></Protected>} />
        <Route path="/tpk" element={<Protected roles={['kader', 'admin', 'koordinator']}><FormTPK /></Protected>} />
        <Route path="/laporan-tpk" element={<Protected roles={['admin', 'koordinator']}><LaporanTPK /></Protected>} />

        {/* TAMBAHKAN RUTE INI */}
        <Route path="/laporan-kader" element={<Protected roles={['kader', 'admin', 'koordinator']}><LaporanKader /></Protected>} />
        <Route path="/users" element={<Protected roles={['admin']}><Users /></Protected>} />
        <Route path="/settings" element={<Protected roles={['admin']}><Settings /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Tombol Instal PWA hanya muncul jika user sudah login */}
      {user && <InstallPWA />}
      {user && <SyncStatus />} {/* <--- Tambahkan baris ini */}
    </>
  );
}