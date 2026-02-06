-- Add new columns to daily_focus_settings
ALTER TABLE public.daily_focus_settings
  ADD COLUMN IF NOT EXISTS cocktail_id text,
  ADD COLUMN IF NOT EXISTS notes text;

-- Add unique constraint on focus_date if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_focus_settings_focus_date_key'
  ) THEN
    ALTER TABLE public.daily_focus_settings ADD CONSTRAINT daily_focus_settings_focus_date_key UNIQUE (focus_date);
  END IF;
END $$;
