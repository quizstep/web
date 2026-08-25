-- ============================================
-- REVOKE DEVICE SESSION FUNCTION
-- ============================================
--
-- Safely revokes an active device session belonging
-- to the currently authenticated user.
--
-- Uses SECURITY DEFINER to ensure the update succeeds
-- reliably without RLS policy conflicts.
-- ============================================

-- Drop old single-argument signature if present to avoid overload ambiguity
DROP FUNCTION IF EXISTS public.revoke_device_session(bigint);

CREATE OR REPLACE FUNCTION public.revoke_device_session(
  p_session_id bigint DEFAULT NULL,
  p_device_id text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_updated_count integer;
BEGIN
  -- 1. Get authenticated user
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'reason', 'not_authenticated'
    );
  END IF;

  -- 2. Validate input parameters
  IF p_session_id IS NULL AND (p_device_id IS NULL OR length(trim(p_device_id)) = 0) THEN
    RETURN json_build_object(
      'success', false,
      'reason', 'missing_parameters'
    );
  END IF;

  -- 3. Mark session(s) as revoked
  IF p_session_id IS NOT NULL THEN
    UPDATE user_sessions
    SET revoked_at = now()
    WHERE id = p_session_id
      AND user_id = v_user_id
      AND revoked_at IS NULL;
  ELSE
    UPDATE user_sessions
    SET revoked_at = now()
    WHERE user_id = v_user_id
      AND device_id = trim(p_device_id)
      AND revoked_at IS NULL;
  END IF;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  -- 4. Check if any row was updated
  IF v_updated_count = 0 THEN
    RETURN json_build_object(
      'success', false,
      'reason', 'session_not_found_or_already_revoked',
      'updated_count', 0
    );
  END IF;

  -- 5. Success
  RETURN json_build_object(
    'success', true,
    'reason', 'revoked_successfully',
    'updated_count', v_updated_count
  );
END;
$$;


-- ============================================
-- PERMISSIONS
-- ============================================

REVOKE ALL ON FUNCTION public.revoke_device_session(bigint, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.revoke_device_session(bigint, text) TO authenticated;
