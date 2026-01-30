import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase environment variables not configured. Authentication features will not work.')
    console.warn('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel dashboard.')
}

// Usa valores de fallback se as variáveis não estiverem definidas
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
)
