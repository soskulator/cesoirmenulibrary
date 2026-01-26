-- Change question_id from UUID to TEXT to support static question IDs
ALTER TABLE public.foh_test_answers 
ALTER COLUMN question_id TYPE text USING question_id::text;