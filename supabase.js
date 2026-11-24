
// ==========================================
// KEYIAN WARD BURSARY
// SUPABASE DATABASE CONNECTION
// ==========================================

const SUPABASE_URL = "https://avwxamdsydtrkjnfpszx.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_tZe30HjVMuXWXA4CCrHv7A_WGiHMaTO";

// Create Supabase connection
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

// Make connection available to other JavaScript files
window.supabaseClient = supabaseClient;

console.log("Keyian Ward Bursary Supabase connection initialized successfully!");
