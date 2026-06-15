DROP POLICY IF EXISTS "Authenticated users can view configurations" ON public.test_configurations;
CREATE POLICY "Authenticated users can view configurations" ON public.test_configurations FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can view assignments" ON public.test_question_assignments;
CREATE POLICY "Authenticated users can view assignments" ON public.test_question_assignments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update own attempts" ON public.foh_test_attempts;
CREATE POLICY "Users can update own attempts" ON public.foh_test_attempts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view menu images" ON storage.objects;
DROP POLICY IF EXISTS "Email assets are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public can view admin assets" ON storage.objects;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assign_role_from_invitation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_staff_invitation_role() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_staff_invitation_status() FROM PUBLIC, anon, authenticated;