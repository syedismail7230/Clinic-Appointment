import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    try {
        console.log("Fetching clinics...");
        const { data, error } = await supabase.from('clinics').select('id, name, lat, lng, address');
        if (error) {
            console.error("Error fetching clinics:", error);
        } else {
            console.log("Clinics in DB:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Caught error:", e);
    }
}

run();
