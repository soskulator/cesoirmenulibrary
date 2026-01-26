-- Create table for storing test attempts
CREATE TABLE public.foh_test_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  score INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  percentage NUMERIC DEFAULT 0,
  is_reviewed BOOLEAN DEFAULT false,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Create table for storing individual answers
CREATE TABLE public.foh_test_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES public.foh_test_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL,
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  ai_feedback TEXT,
  admin_override BOOLEAN,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.foh_test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foh_test_answers ENABLE ROW LEVEL SECURITY;

-- Policies for attempts
CREATE POLICY "Users can view own attempts" ON public.foh_test_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts" ON public.foh_test_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attempts" ON public.foh_test_attempts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all attempts" ON public.foh_test_attempts
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all attempts" ON public.foh_test_attempts
  FOR UPDATE USING (is_admin(auth.uid()));

-- Policies for answers
CREATE POLICY "Users can view own answers" ON public.foh_test_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.foh_test_attempts 
      WHERE id = attempt_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own answers" ON public.foh_test_answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.foh_test_attempts 
      WHERE id = attempt_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all answers" ON public.foh_test_answers
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all answers" ON public.foh_test_answers
  FOR UPDATE USING (is_admin(auth.uid()));