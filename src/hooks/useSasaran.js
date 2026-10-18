import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useSasaran(bidang = '', rw = '') {
  const [sasaran, setSasaran] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSasaran = async () => {
    setLoading(true);
    let query = supabase.from('sasaran').select('*').eq('aktif', true);

    if (bidang) query = query.eq('bidang', bidang);
    if (rw) query = query.eq('rw', rw);

    const { data, error } = await query.order('nama');
    if (!error) setSasaran(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSasaran();
  }, [bidang, rw]);

  return { sasaran, loading, fetchSasaran };
}