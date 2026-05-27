-- ============================================================
-- Srimuni Hotels — RLS Security Fix
-- Run this in Supabase SQL Editor → resolves both critical alerts
--
-- WHY THIS IS SAFE:
--   All data access goes through Supabase Edge Functions which use
--   SUPABASE_SERVICE_ROLE_KEY. The service role BYPASSES RLS entirely,
--   so enabling RLS here does NOT break any existing functionality.
--
--   Enabling RLS with no permissive policies simply means:
--   → Anon/authenticated REST API calls → DENIED (locked down)
--   → Edge functions (service role) → ALLOWED (bypass RLS)
-- ============================================================

-- Step 1: Enable RLS on all three tables
ALTER TABLE travel_partners    ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE followup_logs      ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing overly-permissive policies
DROP POLICY IF EXISTS "Allow all operations" ON travel_partners;
DROP POLICY IF EXISTS "Allow all operations" ON commission_entries;
DROP POLICY IF EXISTS "Allow all operations" ON followup_logs;

-- Step 3: No new policies needed.
--   With RLS enabled and no policies → anon/authenticated roles get zero access.
--   Service role (used by all edge functions) bypasses RLS → full access.
--   This is the most secure configuration for a staff-only internal tool.

-- ============================================================
-- Verify the fix (run these selects to confirm):
-- ============================================================
-- SELECT tablename, rowsecurity FROM pg_tables
--   WHERE schemaname = 'public'
--   AND tablename IN ('travel_partners', 'commission_entries', 'followup_logs');
--
-- Expected: rowsecurity = true for all three tables
-- ============================================================
