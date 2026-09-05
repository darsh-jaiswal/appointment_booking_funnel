-- ================================================================
-- admin-auth-migration.sql
-- Run ONCE in Supabase → SQL Editor → New query → Run
--
-- Replaces the plaintext ADMIN_SECRET check (shipped to every
-- visitor's browser in secrets.js, and callable by anyone via the
-- anon key) with a real Supabase Auth check. Only a signed-in user
-- whose email matches ADMIN_EMAIL below can call these functions.
--
-- BEFORE RUNNING THIS: create the admin login yourself in
-- Supabase → Authentication → Users → Add user
-- (email: hello@example-coaching.com, set a real password).
-- Do this in the Supabase dashboard directly — never share this
-- password with anyone, including in chat or code.
-- ================================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.jwt() ->> 'email' = 'hello@example-coaching.com'
$$;

-- ── get_all_leads ──
DROP FUNCTION IF EXISTS get_all_leads(text);
CREATE FUNCTION get_all_leads()
RETURNS TABLE(
  id           uuid,
  first_name   text,
  email        text,
  phone        text,
  profession   text,
  lead_score   int,
  lead_tier    text,
  safety_flag  boolean,
  quiz_answers jsonb,
  created_at   timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY
    SELECT
      l.id, l.first_name, l.email, l.phone, l.profession,
      l.lead_score, l.lead_tier, l.safety_flag, l.quiz_answers,
      l.created_at
    FROM leads l
    ORDER BY l.created_at DESC;
END;
$$;
REVOKE EXECUTE ON FUNCTION get_all_leads() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_all_leads() TO authenticated;

-- ── get_all_appointments ──
DROP FUNCTION IF EXISTS get_all_appointments(text);
CREATE FUNCTION get_all_appointments()
RETURNS SETOF appointments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY SELECT * FROM appointments ORDER BY scheduled_at ASC;
END;
$$;
REVOKE EXECUTE ON FUNCTION get_all_appointments() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_all_appointments() TO authenticated;

-- ── cancel_appointment ──
DROP FUNCTION IF EXISTS cancel_appointment(uuid, text);
CREATE FUNCTION cancel_appointment(appt_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  UPDATE appointments SET status = 'cancelled' WHERE id = appt_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION cancel_appointment(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION cancel_appointment(uuid) TO authenticated;

-- ── update_setting ──
DROP FUNCTION IF EXISTS update_setting(text, jsonb, text);
CREATE FUNCTION update_setting(p_key text, p_val jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  UPDATE settings SET setting_val = p_val, updated_at = now() WHERE setting_key = p_key;
END;
$$;
REVOKE EXECUTE ON FUNCTION update_setting(text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION update_setting(text, jsonb) TO authenticated;
