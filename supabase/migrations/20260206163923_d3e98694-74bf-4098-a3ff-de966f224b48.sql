-- Add difficulty_filter column to test_configurations
-- NULL or empty array means "all difficulties" (no filter)
ALTER TABLE public.test_configurations
ADD COLUMN difficulty_filter text[] DEFAULT NULL;