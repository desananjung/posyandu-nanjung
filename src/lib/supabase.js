import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY wajib ada di .env');
}

// Client Utama (Untuk Login, CRUD, dll)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Client Khusus SignUp (Admin mendaftarkan kader baru)
// Kita beri storageKey yang berbeda dan mematikan session agar tidak bentrok
export const supabaseAdminAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    storageKey: 'supabase-admin-auth-token' // <-- Ini kuncinya
  }
});