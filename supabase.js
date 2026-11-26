
// ==========================================
// KEYIAN WARD BURSARY
// SUPABASE DATABASE CONNECTION
// ==========================================

const SUPABASE_URL = "https://avwxamdsydtrkjnfpszx.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_tZe30HjVMuXWXA4CCrHv7A_WGiHMaTO";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: window.localStorage
        }
    }
);

window.supabaseClient = supabaseClient;

console.log("Keyian Ward Bursary connected successfully!");
