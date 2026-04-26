import { createClient } from '@supabase/supabase-js'
console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);

// Vite requires 'import.meta.env' to read .env files
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)