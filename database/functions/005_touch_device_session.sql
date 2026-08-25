-- ============================================
-- TOUCH DEVICE SESSION (SLIDING EXPIRATION)
-- ============================================
--
-- Extends the session expiration by 14 days and
-- updates last_active_at whenever the user actively
-- uses QuizStep.
--
-- Uses SECURITY DEFINER to bypass RLS restrictions safely.
-- ============================================

CREATE OR REPLACE FUNCTION public.touch_device_session(
  p_device_id text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_updated_count integer;
  v_new_expires_at timestamptz;
BEGIN
  -- 1. Get authenticated user
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'reason', 'not_authenticated'
    );
  END IF;

  -- 2. Validate device ID
  IF p_device_id IS NULL OR length(trim(p_device_id)) = 0 THEN
    RETURN json_build_object(
      'success', false,
      'reason', 'invalid_device_id'
    );
  END IF;

  v_new_expires_at := now() + interval '14 days';

  -- 3. Extend active session for this device
  UPDATE user_sessions
  SET
    last_active_at = now(),
    expires_at = v_new_expires_at
  WHERE user_id = v_user_id
    AND device_id = trim(p_device_id)
    AND revoked_at IS NULL
    AND expires_at > now();

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  IF v_updated_count = 0 THEN
    RETURN json_build_object(
      'success', false,
      'reason', 'session_not_found_or_inactive',
      'updated_count', 0
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'reason', 'session_extended',
    'expires_at', v_new_expires_at
  );
END;
$$;


-- ============================================
-- PERMISSIONS
-- ============================================

REVOKE ALL ON FUNCTION public.touch_device_session(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.touch_device_session(text) TO authenticated;
