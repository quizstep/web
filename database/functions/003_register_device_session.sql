-- ============================================
-- USER SESSION / DEVICE LIMIT FUNCTIONS
-- ============================================

-- ============================================================
-- CHECK AND CREATE DEVICE SESSION
-- ============================================================
--
-- Rules:
-- 1. User must be authenticated.
-- 2. If this device already has an active session:
--      → refresh it and allow login.
-- 3. If fewer than 2 active devices exist:
--      → create a new session and allow login.
-- 4. If 2 active devices already exist:
--      → reject the new device.
--
-- A transaction-level advisory lock prevents two simultaneous
-- login requests from bypassing the 2-device limit.
-- ============================================================

CREATE OR REPLACE FUNCTION public.register_device_session(
  p_device_id text,
  p_device_name text DEFAULT NULL,
  p_device_type text DEFAULT 'unknown',
  p_browser_name text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$

DECLARE
  v_user_id uuid;
  v_existing_session_id bigint;
  v_active_device_count integer;
  v_new_session_id bigint;

BEGIN

  -- ==========================================
  -- 1. Get authenticated user
  -- ==========================================

  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN

    RETURN json_build_object(
      'success', false,
      'allowed', false,
      'reason', 'not_authenticated'
    );

  END IF;


  -- ==========================================
  -- 2. Validate device ID
  -- ==========================================

  IF p_device_id IS NULL
     OR length(trim(p_device_id)) = 0 THEN

    RETURN json_build_object(
      'success', false,
      'allowed', false,
      'reason', 'invalid_device_id'
    );

  END IF;


  -- ==========================================
  -- 3. Validate device type
  -- ==========================================

  IF p_device_type NOT IN (
    'phone',
    'tablet',
    'desktop',
    'unknown'
  ) THEN

    RETURN json_build_object(
      'success', false,
      'allowed', false,
      'reason', 'invalid_device_type'
    );

  END IF;


  -- ==========================================
  -- 4. Lock this user's session operation
  -- ==========================================
  --
  -- This prevents two simultaneous requests for
  -- the same user from both seeing an available
  -- device slot.
  --
  -- The lock exists only for this transaction.
  -- ==========================================

  PERFORM pg_advisory_xact_lock(
    hashtextextended(v_user_id::text, 0)
  );


  -- ==========================================
  -- 4b. Clean up expired sessions
  -- ==========================================
  --
  -- Mark any of this user's expired sessions as
  -- revoked.  Prevents stale rows (revoked_at IS
  -- NULL but expires_at in the past) from blocking
  -- the unique index or creating inconsistent state.
  -- ==========================================

  UPDATE user_sessions
  SET revoked_at = now()
  WHERE user_id = v_user_id
    AND revoked_at IS NULL
    AND expires_at <= now();


  -- ==========================================
  -- 5. Check whether this device already exists
  -- ==========================================

  SELECT id
  INTO v_existing_session_id
  FROM user_sessions
  WHERE user_id = v_user_id
    AND device_id = p_device_id
    AND revoked_at IS NULL
    AND expires_at > now()
  LIMIT 1;


  -- ==========================================
  -- 6. Existing device — refresh and allow
  -- ==========================================

  IF v_existing_session_id IS NOT NULL THEN

    UPDATE user_sessions
    SET
      last_active_at = now(),
      expires_at = now() + interval '14 days',
      browser_name = COALESCE(p_browser_name, browser_name)
    WHERE id = v_existing_session_id;


    RETURN json_build_object(
      'success', true,
      'allowed', true,
      'reason', 'existing_device',
      'session_id', v_existing_session_id
    );

  END IF;


  -- ==========================================
  -- 7. Count active devices
  -- ==========================================

  SELECT COUNT(*)
  INTO v_active_device_count
  FROM user_sessions
  WHERE user_id = v_user_id
    AND revoked_at IS NULL
    AND expires_at > now();


  -- ==========================================
  -- 8. Device limit reached
  -- ==========================================

  IF v_active_device_count >= 2 THEN

    RETURN json_build_object(
      'success', true,
      'allowed', false,
      'reason', 'device_limit_reached',
      'active_devices', v_active_device_count
    );

  END IF;


  -- ==========================================
  -- 8b. Defensive cleanup for this device
  -- ==========================================
  -- Revoke any lingering unrevoked row for this
  -- device before creating a new active session row.

  UPDATE user_sessions
  SET revoked_at = now()
  WHERE user_id = v_user_id
    AND device_id = p_device_id
    AND revoked_at IS NULL;


  -- ==========================================
  -- 9. Create new session
  -- ==========================================

  INSERT INTO user_sessions (
    user_id,
    device_id,
    device_name,
    device_type,
    browser_name,
    created_at,
    last_active_at,
    expires_at
  )
  VALUES (
    v_user_id,
    p_device_id,
    p_device_name,
    p_device_type,
    p_browser_name,
    now(),
    now(),
    now() + interval '14 days'
  )
  RETURNING id
  INTO v_new_session_id;


  -- ==========================================
  -- 10. Success
  -- ==========================================

  RETURN json_build_object(
    'success', true,
    'allowed', true,
    'reason', 'new_device',
    'session_id', v_new_session_id
  );

END;
$$;


-- ============================================
-- PERMISSIONS
-- ============================================

-- Remove default access.
REVOKE ALL
ON FUNCTION public.register_device_session(text, text, text, text)
FROM PUBLIC;


-- Authenticated users can call the function.
GRANT EXECUTE
ON FUNCTION public.register_device_session(text, text, text, text)
TO authenticated;