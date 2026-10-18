import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useKegiatan() {
  const { user } = useAuth();
  const [kegiatan, setKegiatan] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchKegiatan = async () => {
    setLoading(true);
    let query = supabase
      .from('kegiatan')
      .select(`*, profiles:created_by (nama)`)
      .order('tanggal', { ascending: false });

    // RLS otomatis memfilter, tapi kita bisa tambahkan filter frontend untuk safety
    const { data, error } = await query;
    
    if (!error) setKegiatan(data || []);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from('kegiatan')
      .update({ status })
      .eq('id', id);
    if (!error) fetchKegiatan();
    return { error };
  };

  useEffect(() => {
    fetchKegiatan();
  }, []);

  return { kegiatan, loading, fetchKegiatan, updateStatus };
}