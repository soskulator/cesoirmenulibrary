
-- Allow admins to delete test attempts
CREATE POLICY "Admins can delete test attempts"
ON public.foh_test_attempts
FOR DELETE
USING (is_admin(auth.uid()));

-- Allow admins to delete test answers
CREATE POLICY "Admins can delete test answers"
ON public.foh_test_answers
FOR DELETE
USING (is_admin(auth.uid()));
