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
  { id: 'dahlia_1', nama: 'Posyandu Dahlia 1', rw: 'RW01' },
  { id: 'dahlia_2', nama: 'Posyandu Dahlia 2', rw: 'RW02' },
  { id: 'dahlia_3', nama: 'Posyandu Dahlia 3', rw: 'RW03' },
  { id: 'dahlia_4', nama: 'Posyandu Dahlia 4', rw: 'RW04' },
  { id: 'dahlia_5', nama: 'Posyandu Dahlia 5', rw: 'RW05' },
  { id: 'dahlia_6', nama: 'Posyandu Dahlia 6', rw: 'RW06' },
  { id: 'dahlia_7', nama: 'Posyandu Dahlia 7', rw: 'RW07' },
  { id: 'dahlia_8', nama: 'Posyandu Dahlia 8', rw: 'RW08' },
  { id: 'dahlia_9', nama: 'Posyandu Dahlia 9', rw: 'RW09' },
  { id: 'dahlia_10', nama: 'Posyandu Dahlia 10', rw: 'RW10' },
  { id: 'dahlia_11', nama: 'Posyandu Dahlia 11', rw: 'RW11' },
  { id: 'dahlia_12', nama: 'Posyandu Dahlia 12', rw: 'RW12' },
  { id: 'dahlia_13', nama: 'Posyandu Dahlia 13', rw: 'RW13' },
  { id: 'dahlia_14', nama: 'Posyandu Dahlia 14', rw: 'RW08' }, // Contoh 1 RW 2 Posyandu
];

export const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const JABATAN_LIST = [
  'Ketua Posyandu',
  'Sekretaris',
  'Bendahara',
  'Ketua Bidang Pendidikan',
  'Ketua Bidang Kesehatan',
  'Ketua Bidang Pekerjaan Umum',
  'Ketua Bidang Perumahan Rakyat',
  'Ketua Bidang Trantibumlinmas',
  'Ketua Bidang Sosial',
  'Anggota / Kader Umum'
];

export const SIKLUS_HIDUP_LIST = [
  'Ibu Hamil, Bersalin, dan Nifas',
  'Bayi dan Balita (0-5 Tahun)',
  'Anak Usia Sekolah dan Remaja (6-18 Tahun)',
  'Usia Dewasa (19-59 Tahun)',
  'Lansia (≥ 60 Tahun)',
  'Pengendalian Penyakit Menular' // Opsional, sesuai ILP [citation:7]
];