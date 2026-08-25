-- ============================================
-- RLS FOR USER SESSIONS (REVOCATION)
-- ============================================
--
-- The SELECT policy is defined in:
--   database/schema/009_user_sessions.sql
--
-- This file adds an UPDATE policy so users can
-- revoke their own sessions via the browser client.
--
-- The register_device_session() function uses
-- SECURITY DEFINER, so it bypasses RLS for
-- insert/update operations.
-- ============================================


-- ============================================
-- USERS CAN REVOKE THEIR OWN SESSIONS
-- ============================================
--
-- Allows setting revoked_at on rows the user owns.
-- The WITH CHECK ensures revoked_at must be non-null
-- after the update — meaning you can revoke but
-- cannot un-revoke a session.
-- ============================================

CREATE POLICY "Users can revoke own sessions"
ON user_sessions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND revoked_at IS NOT NULL
);
