import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pjvsocwqqqscngqnsyww.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn('[EventQA] VITE_SUPABASE_ANON_KEY is not set in .env! Please provide your Supabase anon key.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
