import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Supabase project credentials for Ruang Belajarku
export const DEFAULT_SUPABASE_URL = 'https://otqnnalrcuzrcwzncmbf.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90cW5uYWxyY3V6cmN3em5jbWJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMTYzMTYsImV4cCI6MjEwNzY5MjMxNn0.ZlQPVwLqfMio153eYROdVqDeHcUloEUNAvzU37e9EJA';

export const getSupabaseConfig = () => {
  let url = DEFAULT_SUPABASE_URL;
  let anonKey = DEFAULT_SUPABASE_ANON_KEY;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }

  if (typeof window !== 'undefined') {
    const localUrl = localStorage.getItem('rb_supabase_url');
    const localKey = localStorage.getItem('rb_supabase_anon_key');
    if (localUrl && localKey && localUrl.startsWith('https://') && !localUrl.includes('your-project-id')) {
      url = localUrl;
      anonKey = localKey;
    } else if (localUrl && (localUrl.includes('your-project-id') || !localUrl.startsWith('https://'))) {
      localStorage.removeItem('rb_supabase_url');
      localStorage.removeItem('rb_supabase_anon_key');
    }
  }

  const isConfigured = Boolean(
    url &&
    anonKey &&
    !url.includes('your-project-id') &&
    url.startsWith('https://')
  );

  return { url, anonKey, isConfigured };
};

// Singleton Supabase Client
export const supabase = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const getSupabaseClient = (): SupabaseClient => {
  const { url, anonKey } = getSupabaseConfig();
  if (url === DEFAULT_SUPABASE_URL && anonKey === DEFAULT_SUPABASE_ANON_KEY) {
    return supabase;
  }
  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('rb_supabase_url', url);
    localStorage.setItem('rb_supabase_anon_key', anonKey);
  }
};

export const clearSupabaseConfig = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('rb_supabase_url');
    localStorage.removeItem('rb_supabase_anon_key');
  }
};
