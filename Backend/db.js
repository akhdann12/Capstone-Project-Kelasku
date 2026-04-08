const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Pakai service_role key agar backend bisa bypass RLS
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

module.exports = supabase;