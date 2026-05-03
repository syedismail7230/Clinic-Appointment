import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  process.exit(1);
}

// Create a single supabase client for interacting with your database
// We use the service_role key to bypass RLS and let the Express server act as the gatekeeper.
export const supabase = createClient(supabaseUrl, supabaseKey);

// Log connection initialization
console.log(`[DB] Supabase client initialized for ${supabaseUrl}`);

// Export a mock 'db' object to ease transition if needed, or we just export supabase.
export default supabase;
