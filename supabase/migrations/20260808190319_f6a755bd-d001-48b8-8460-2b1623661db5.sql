-- Revoke all default execution rights on the security definer function
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;

-- Only service_role can execute directly (RLS bypasses execute checks anyway for the owner)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
