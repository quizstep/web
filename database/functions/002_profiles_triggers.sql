-- ============================================
-- AUTO-UPDATE updated_at ON EVERY UPDATE
-- ============================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================
-- PREVENT NON-ADMIN ROLE ESCALATION (defense-in-depth)
-- ============================================
CREATE OR REPLACE FUNCTION prevent_role_self_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is changing and the request is not from a service_role context,
  -- silently keep the old role.
  IF NEW.role IS DISTINCT FROM OLD.role
     AND auth.role() != 'service_role' THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_prevent_role_self_escalation
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION prevent_role_self_escalation();