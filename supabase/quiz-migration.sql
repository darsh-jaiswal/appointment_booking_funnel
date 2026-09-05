-- ================================================================
-- quiz-migration.sql
-- Run ONCE in Supabase → SQL Editor → New query → Run
-- Adds quiz answer columns to the leads table.
-- The existing insert_leads RLS policy (WITH CHECK (true))
-- already covers the new columns — no policy change needed.
--
-- The get_all_leads(admin_secret text) definition below is
-- SUPERSEDED by admin-auth-migration.sql, which replaces it with a
-- Supabase Auth-checked version. Only the ALTER TABLE above still
-- applies if you're running this fresh.
-- ================================================================

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS quiz_answers jsonb,
  ADD COLUMN IF NOT EXISTS lead_score   int,
  ADD COLUMN IF NOT EXISTS lead_tier    text,
  ADD COLUMN IF NOT EXISTS safety_flag  boolean DEFAULT false;

-- ── Update get_all_leads to return the new fields ──
-- (This is the admin-only RPC; admin_secret is checked server-side)
CREATE OR REPLACE FUNCTION get_all_leads(admin_secret text)
RETURNS TABLE(
  id          uuid,
  first_name  text,
  email       text,
  phone       text,
  profession  text,
  lead_score  int,
  lead_tier   text,
  safety_flag boolean,
  quiz_answers jsonb,
  created_at  timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    id, first_name, email, phone, profession,
    lead_score, lead_tier, safety_flag, quiz_answers,
    created_at
  FROM leads
  WHERE admin_secret = 'YOUR_ADMIN_SECRET_HERE'   -- replace with the value from admin-dashboard.html
  ORDER BY created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION get_all_leads(text) TO anon;
