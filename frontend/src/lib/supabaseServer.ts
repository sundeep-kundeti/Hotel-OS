import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client for API Routes
// Note: We're not using @supabase/ssr here simply to have a stateless pure Edge client for our REST backend algorithms.
// Using NEXT_PUBLIC_ is fine for browser APIs if we switch, but here we just safely init.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabaseServer = createClient(supabaseUrl, supabaseKey);
