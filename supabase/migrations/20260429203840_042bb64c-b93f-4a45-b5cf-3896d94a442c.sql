-- Recreate missing auth.users triggers (they were not persisted from previous migration)
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_role_from_invitation();

-- Verify by raising notice
DO $$
DECLARE
  trigger_count int;
BEGIN
  SELECT count(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE event_object_schema = 'auth'
    AND event_object_table = 'users'
    AND trigger_name IN ('on_auth_user_created_profile','on_auth_user_created_role');
  RAISE NOTICE 'auth.users triggers present: %', trigger_count;
END $$;