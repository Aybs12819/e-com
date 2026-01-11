CREATE OR REPLACE FUNCTION set_auth_user_id(user_id uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claims.sub', user_id::text, TRUE);
  PERFORM set_config('request.jwt.claims.role', 'authenticated', TRUE);
  RAISE NOTICE 'set_auth_user_id called with user_id: %', user_id;
  RAISE NOTICE 'request.jwt.claims.sub after set_config: %', current_setting('request.jwt.claims.sub', TRUE);
  RAISE NOTICE 'request.jwt.claims.role after set_config: %', current_setting('request.jwt.claims.role', TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;