import { supabase } from './supabase';

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
  if (error) throw error;
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

export const deleteKegiatan = async (id) => {
  const { error } = await supabase.from('kegiatan').delete().eq('id', id);
  if (error) throw error;
};

// ============ FOTO ============

export const uploadFoto = async (file, userId) => {
  const ext = file.name.split('.').pop();
  const filename = `${userId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('foto-kegiatan')
    .upload(filename, file);

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