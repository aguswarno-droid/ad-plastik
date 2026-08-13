import { createClient } from '@supabase/supabase-js'

// Ganti teks di dalam tanda petik dengan URL & Key dari Supabase kamu
const supabaseUrl = 'https://euvuegovsakdeeaibkne.supabase.co'
const supabaseAnonKey = 'sb_publishable_mP64vQohAsEKxZH01grh0g_oMb6Vfkb'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
