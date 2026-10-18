import {
  BookOpen, HeartPulse, Construction, House,
  ShieldCheck, HeartHandshake
} from 'lucide-react';

export const BIDANG = [
  {
    id: 'pendidikan', name: 'Pendidikan', short: 'PAUD & Kesetaraan',
    desc: 'Data sasaran dan kegiatan', icon: BookOpen,
    color: '#1A5D1A', light: '#E8F5E9', border: '#A8D5A8',
    subKegiatan: ['Penyuluhan PAUD', 'Pendataan ATS', 'Kelas Literasi', 'Bimtek Orang Tua']
  },
  {
    id: 'kesehatan', name: 'Kesehatan', short: 'Layanan Dasar',
    desc: 'Pelayanan dan pemantauan', icon: HeartPulse,
    color: '#0E7490', light: '#ECFEFF', border: '#99E6E6',
    subKegiatan: ['Penimbangan Balita', 'Pemeriksaan Ibu Hamil', 'Cek Stunting', 'PMT', 'Imunisasi']
  },
  {
    id: 'pekerjaan_umum', name: 'Pekerjaan Umum', short: 'Infrastruktur',
    desc: 'Infrastruktur dan air bersih', icon: Construction,
    color: '#92400E', light: '#FEF3C7', border: '#F5D78E',
    subKegiatan: ['Cek Air Bersih', 'Jalan Lingkungan', 'Drainase', 'Perbaikan Sumur']
  },
  {
    id: 'perumahan', name: 'Perumahan Rakyat', short: 'Layak Huni',
    desc: 'Rumah dan sanitasi', icon: House,
    color: '#7C3AED', light: '#F3E8FF', border: '#D8B4FE',
    subKegiatan: ['Verifikasi RTLH', 'Jamban Sehat', 'SPAL', 'Sanitasi']
  },
  {
    id: 'trantibum', name: 'Trantibumlinmas', short: 'Ketertiban',
    desc: 'Ketertiban dan kebencanaan', icon: ShieldCheck,
    color: '#B91C1C', light: '#FEF2F2', border: '#FCA5A5',
    subKegiatan: ['Ronda & Siskamling', 'Simulasi Bencana', 'Titik Rawan', 'Linmas']
  },
  {
    id: 'sosial', name: 'Sosial', short: 'Perlindungan',
    desc: 'Warga rentan dan fasilitasi bantuan', icon: HeartHandshake,
    color: '#BE185D', light: '#FFF1F2', border: '#FDA4AF',
    subKegiatan: ['Pendataan DTKS', 'Bansos', 'Pendataan Lansia', 'Disabilitas']
  }
];

// 13 RW
export const RW_LIST = Array.from({ length: 13 }, (_, i) => 
  `RW${String(i + 1).padStart(2, '0')}`
);

// 14 Posyandu beserta lokasi RW-nya
export const POSYANDU_LIST = [
  { id: 'dahlia', nama: 'Posyandu dahlia 1', rw: 'RW01' },
  { id: 'dahlia', nama: 'Posyandu dahlia 2', rw: 'RW02' },
  { id: 'dahlia', nama: 'Posyandu dahlia 3', rw: 'RW03' },
  { id: 'dahlia', nama: 'Posyandu dahlia 4', rw: 'RW04' },
  { id: 'dahlia', nama: 'Posyandu dahlia 5', rw: 'RW05' },
  { id: 'dahlia', nama: 'Posyandu dahlia 6', rw: 'RW06' }, // Contoh: 1 RW 2 Posyandu
  { id: 'dahlia', nama: 'Posyandu dahlia 7', rw: 'RW07' },
  { id: 'dahlia', nama: 'Posyandu dahlia 8', rw: 'RW08' },
  { id: 'dahlia', nama: 'Posyandu dahlia 9', rw: 'RW09' },
  { id: 'dahlia', nama: 'Posyandu dahlia 10', rw: 'RW10' },
  { id: 'dahlia', nama: 'Posyandu dahlia 11', rw: 'RW11' },
  { id: 'dahlia', nama: 'Posyandu dahlia 12', rw: 'RW12' },
  { id: 'dahlia', nama: 'Posyandu dahlia 13', rw: 'RW13' },
  { id: 'dahlia', nama: 'Posyandu dahlia 14', rw: 'RW08' },
];

export const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];