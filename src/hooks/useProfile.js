import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useProfile() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setProfiles(data);
    setLoading(false);
  };

  const updateRole = async (id, role, rw) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role, rw })
      .eq('id', id);
    if (!error) fetchProfiles();
    return { error };
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return { profiles, loading, fetchProfiles, updateRole };
}