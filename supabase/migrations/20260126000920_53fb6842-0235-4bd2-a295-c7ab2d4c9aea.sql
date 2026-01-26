-- Add test_type column to foh_test_questions to distinguish between service staff and server assistant tests
ALTER TABLE public.foh_test_questions 
ADD COLUMN test_type text NOT NULL DEFAULT 'service_staff';

-- Add test_type column to foh_test_attempts to track which test type was taken
ALTER TABLE public.foh_test_attempts
ADD COLUMN test_type text NOT NULL DEFAULT 'service_staff';

-- Create an index for faster filtering by test_type
CREATE INDEX idx_foh_test_questions_test_type ON public.foh_test_questions(test_type);
CREATE INDEX idx_foh_test_attempts_test_type ON public.foh_test_attempts(test_type);

-- Delete all existing questions to prepare for new test data
DELETE FROM public.foh_test_questions;