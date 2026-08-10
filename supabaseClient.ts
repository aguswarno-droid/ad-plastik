import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://euvuegovsakdeeaibkne.supabase.co";

const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_mP64vQohAsEKxZH01grh0g_oMb6Vfkb"; // masukkan Publishable Key Supabase kamu di sini

export const supabase = createClient(supabaseUrl, supabaseAnonKey);