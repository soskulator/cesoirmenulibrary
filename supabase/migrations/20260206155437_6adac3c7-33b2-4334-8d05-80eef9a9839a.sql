
-- Table 1: quiz_questions
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'short_answer')),
  options JSONB,
  correct_index INTEGER,
  category TEXT NOT NULL CHECK (category IN ('service', 'menu', 'drinks', 'operations', 'general', 'allergy', 'wine', 'spirits', 'cocktails', 'food')),
  difficulty TEXT NOT NULL DEFAULT 'standard' CHECK (difficulty IN ('basic', 'standard', 'advanced')),
  target_roles TEXT[] NOT NULL DEFAULT '{server,bartender}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table 2: test_configurations
CREATE TABLE public.test_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name TEXT NOT NULL,
  test_type TEXT NOT NULL CHECK (test_type IN ('service_staff', 'server_assistant', 'wine', 'food', 'spirits', 'cocktails', 'allergy')),
  total_questions INTEGER NOT NULL DEFAULT 30,
  time_limit_minutes INTEGER,
  passing_score INTEGER NOT NULL DEFAULT 70,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table 3: test_question_assignments
CREATE TABLE public.test_question_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_config_id UUID NOT NULL REFERENCES public.test_configurations(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  sort_order INTEGER,
  is_required BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (test_config_id, question_id)
);

-- Triggers for updated_at
CREATE TRIGGER update_quiz_questions_updated_at
  BEFORE UPDATE ON public.quiz_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_test_configurations_updated_at
  BEFORE UPDATE ON public.test_configurations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_question_assignments ENABLE ROW LEVEL SECURITY;

-- quiz_questions policies
CREATE POLICY "Authenticated users can view active questions"
  ON public.quiz_questions FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert questions"
  ON public.quiz_questions FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update questions"
  ON public.quiz_questions FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete questions"
  ON public.quiz_questions FOR DELETE
  USING (is_admin(auth.uid()));

-- test_configurations policies
CREATE POLICY "Authenticated users can view configurations"
  ON public.test_configurations FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert configurations"
  ON public.test_configurations FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update configurations"
  ON public.test_configurations FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete configurations"
  ON public.test_configurations FOR DELETE
  USING (is_admin(auth.uid()));

-- test_question_assignments policies
CREATE POLICY "Authenticated users can view assignments"
  ON public.test_question_assignments FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert assignments"
  ON public.test_question_assignments FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update assignments"
  ON public.test_question_assignments FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete assignments"
  ON public.test_question_assignments FOR DELETE
  USING (is_admin(auth.uid()));

-- Seed default test configurations
INSERT INTO public.test_configurations (test_name, test_type, total_questions, passing_score)
VALUES
  ('Server & Bartender Test', 'service_staff', 30, 70),
  ('Server Assistant Test', 'server_assistant', 20, 70);
