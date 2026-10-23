import { supabase } from './supabase';
import * as XLSX from 'xlsx';

// ============ KEGIATAN ============

export const getKegiatan = async (filters = {}) => {
  let query = supabase
    .from('kegiatan')
    .select(`
      *,
      profiles:created_by (nama)
    `)
    .order('tanggal', { ascending: false });

  if (filters.bidang) query = query.eq('bidang', filters.bidang);
  if (filters.rw) query = query.eq('rw', filters.rw);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.bulan && filters.tahun) {
    const start = `${filters.tahun}-${String(filters.bulan).padStart(2, '0')}-01`;
    const end = new Date(filters.tahun, filters.bulan, 0).toISOString().slice(0, 10);
    query = query.gte('tanggal', start).lte('tanggal', end);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getKegiatanById = async (id) => {
  const { data, error } = await supabase
    .from('kegiatan')
    .select('*, profiles:created_by (nama)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export const createKegiatan = async (payload) => {
  const { data, error } = await supabase
    .from('kegiatan')
    .insert(payload)
    .select()
    .single();
  if (error) {
    console.error("Error Supabase:", error);
    throw error;
  }
  return data;
};

export const updateKegiatan = async (id, payload) => {
  const { data, error } = await supabase
    .from('kegiatan')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Fungsi Hapus (Hanya ada SATU sekarang)
export const deleteKegiatan = async (id) => {
  const { error } = await supabase
    .from('kegiatan')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

// ============ FOTO ============

export const uploadFoto = async (file, userId) => {
  const arrayBuffer = await file.arrayBuffer();
  const ext = file.name.split('.').pop();
  const filename = `${userId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('foto-kegiatan')
    .upload(filename, arrayBuffer, {
        contentType: file.type || 'image/png',
        upsert: true
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('foto-kegiatan')
    .getPublicUrl(filename);

  return data.publicUrl;
};

// ============ STATISTIK ============

export const getStatistik = async () => {
  const now = new Date();
  const bulan = now.getMonth() + 1;
  const tahun = now.getFullYear();
  const start = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
  const end = new Date(tahun, bulan, 0).toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('kegiatan')
    .select('*')
    .gte('tanggal', start)
    .lte('tanggal', end);

  if (error) throw error;

  const totalKegiatan = data.length;
  const totalSasaran = data.reduce((a, k) => a + (k.sasaran || 0), 0);
  const belumLengkap = data.filter((k) => k.status === 'draft').length;

  const perBidang = {};
  const perRW = {};

  data.forEach((k) => {
    perBidang[k.bidang] = (perBidang[k.bidang] || 0) + 1;
    perRW[k.rw] = (perRW[k.rw] || 0) + 1;
  });

  return { totalKegiatan, totalSasaran, belumLengkap, perBidang, perRW };
};

// ============ SASARAN ============

export const getSasaran = async (filters = {}) => {
  let query = supabase.from('sasaran').select('*').eq('aktif', true);

  if (filters.bidang) query = query.eq('bidang', filters.bidang);
  if (filters.rw) query = query.eq('rw', filters.rw);

  const { data, error } = await query.order('nama');
  if (error) throw error;
  return data;
};

export const createSasaran = async (payload) => {
  const { data, error } = await supabase.from('sasaran').insert(payload).select().single();
  if (error) throw error;
  return data;
};

// ============ UTILITY EKSPOR ============

export const exportToCSV = (data, filename = 'laporan.csv') => {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvRows = data.map(row => 
    headers.map(header => {
      let cell = row[header] === null || row[header] === undefined ? '' : row[header];
      if (typeof cell === 'string' && cell.includes(',')) {
        cell = `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',')
  );

  const csvString = [headers.join(','), ...csvRows].join('\n');
  
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const formatTanggal = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
};

export const updateSasaran = async (id, payload) => {
  const { data, error } = await supabase
    .from('sasaran')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteSasaran = async (id) => {
  const { error } = await supabase
    .from('sasaran')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

// ============ MANAJEMEN USER ============

export const updateUserProfile = async (id, payload) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteUserProfile = async (id) => {
  // 1. Nonaktifkan profil
  const { error: errProfile } = await supabase
    .from('profiles')
    .update({ aktif: false, nama: 'User Dihapus' })
    .eq('id', id);
  if (errProfile) throw errProfile;

  // 2. Ubah email di auth agar tidak bisa login (opsional, jika Anda punya akses)
  // Jika tidak punya akses, setidaknya profil sudah dinonaktifkan.
  return true;
};
export const backupDataKeExcel = async () => {
  try {
    // 1. Ambil semua data dari Supabase
    const { data: kegiatan } = await supabase.from('kegiatan').select('*');
    const { data: sasaran } = await supabase.from('sasaran').select('*');
    const { data: tpk } = await supabase.from('pendampingan_tpk').select('*');
    const { data: paudAnak } = await supabase.from('paud_anak').select('*');
    const { data: paudAts } = await supabase.from('paud_ats').select('*');

    // 2. Buat Workbook Excel
    const wb = XLSX.utils.book_new();

    // 3. Masukkan data ke Sheet yang berbeda-beda
    const wsKegiatan = XLSX.utils.json_to_sheet(kegiatan || []);
    XLSX.utils.book_append_sheet(wb, wsKegiatan, 'Kegiatan 6 SPM');

    const wsSasaran = XLSX.utils.json_to_sheet(sasaran || []);
    XLSX.utils.book_append_sheet(wb, wsSasaran, 'Data Sasaran');

    const wsTpk = XLSX.utils.json_to_sheet(tpk || []);
    XLSX.utils.book_append_sheet(wb, wsTpk, 'Pendampingan TPK');

    const wsPaudAnak = XLSX.utils.json_to_sheet(paudAnak || []);
    XLSX.utils.book_append_sheet(wb, wsPaudAnak, 'Anak PAUD');

    const wsPaudAts = XLSX.utils.json_to_sheet(paudAts || []);
    XLSX.utils.book_append_sheet(wb, wsPaudAts, 'Anak Putus Sekolah');

    // 4. Unduh File
    const tanggal = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Backup_Posyandu_Nanjung_${tanggal}.xlsx`);
    
    return true;
  } catch (error) {
    console.error("Gagal backup:", error);
    throw error;
  }
};
// Fungsi Helper untuk mengunduh file CSV
const downloadCSV = (data, filename) => {
  if (!data || !data.length) {
    alert(`Data ${filename} kosong.`);
    return;
  }
  const headers = Object.keys(data[0]);
  const csvRows = data.map(row => 
    headers.map(header => {
      let cell = row[header] === null || row[header] === undefined ? '' : row[header];
      if (typeof cell === 'string' && cell.includes(',')) {
        cell = `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',')
  );
  const csvString = [headers.join(','), ...csvRows].join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Fungsi Utama Backup CSV
export const backupDataKeCSV = async () => {
  try {
    const tanggal = new Date().toISOString().slice(0, 10);

    const { data: kegiatan } = await supabase.from('kegiatan').select('*');
    downloadCSV(kegiatan, `Backup_Kegiatan_${tanggal}.csv`);

    const { data: sasaran } = await supabase.from('sasaran').select('*');
    downloadCSV(sasaran, `Backup_Sasaran_${tanggal}.csv`);

    const { data: tpk } = await supabase.from('pendampingan_tpk').select('*');
    downloadCSV(tpk, `Backup_TPK_${tanggal}.csv`);

    const { data: paud } = await supabase.from('paud_anak').select('*');
    downloadCSV(paud, `Backup_PAUD_${tanggal}.csv`);

    return true;
  } catch (error) {
    console.error("Gagal backup CSV:", error);
    throw error;
  }
};