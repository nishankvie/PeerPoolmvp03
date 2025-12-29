import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Return a mock client if Supabase is not configured
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local');
    return null as any; // Return null - components should handle this
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
};
