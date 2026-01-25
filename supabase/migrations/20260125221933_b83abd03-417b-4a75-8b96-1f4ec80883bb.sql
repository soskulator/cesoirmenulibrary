-- Create table for FoH test questions
CREATE TABLE public.foh_test_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'short_answer')),
  options JSONB DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  correct_index INTEGER,
  category TEXT NOT NULL CHECK (category IN ('service', 'menu', 'drinks', 'operations', 'general')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.foh_test_questions ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view active questions
CREATE POLICY "Authenticated users can view active questions"
ON public.foh_test_questions
FOR SELECT
TO authenticated
USING (is_active = true);

-- Admins can view all questions
CREATE POLICY "Admins can view all questions"
ON public.foh_test_questions
FOR SELECT
USING (is_admin(auth.uid()));

-- Admins can insert questions
CREATE POLICY "Admins can insert questions"
ON public.foh_test_questions
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Admins can update questions
CREATE POLICY "Admins can update questions"
ON public.foh_test_questions
FOR UPDATE
USING (is_admin(auth.uid()));

-- Admins can delete questions
CREATE POLICY "Admins can delete questions"
ON public.foh_test_questions
FOR DELETE
USING (is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_foh_test_questions_updated_at
BEFORE UPDATE ON public.foh_test_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();