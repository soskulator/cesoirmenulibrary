-- Add policy for admins to delete quiz scores (needed for remove employee feature)
CREATE POLICY "Admins can delete quiz scores"
ON public.quiz_scores
FOR DELETE
USING (is_admin(auth.uid()));

-- Add policy for admins to delete study progress (needed for remove employee feature)
CREATE POLICY "Admins can delete study progress"
ON public.study_progress
FOR DELETE
USING (is_admin(auth.uid()));

-- Add policy for admins to delete staff activity logs (needed for remove employee feature)
CREATE POLICY "Admins can delete staff activity"
ON public.staff_activity_log
FOR DELETE
USING (is_admin(auth.uid()));