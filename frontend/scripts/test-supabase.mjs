import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE URL or KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  console.log("Sending test query to Supabase...");
  // Let's test a simple query on a typical table or just get the current time if possible, or any table.
  // We'll query 'reservations' which was seen in setup-db.mjs
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .limit(1);

  if (error) {
    console.error("Error executing query:", error.message);
  } else {
    console.log("Query successful! Data:", data);
  }
}

testQuery();
