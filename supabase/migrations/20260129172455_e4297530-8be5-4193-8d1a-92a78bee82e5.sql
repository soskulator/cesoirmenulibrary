-- Create a table for storing daily focus settings
CREATE TABLE public.daily_focus_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  focus_date DATE NOT NULL UNIQUE,
  menu_item_ids TEXT[] NOT NULL DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.daily_focus_settings ENABLE ROW LEVEL SECURITY;

-- Admins can view all daily focus settings
CREATE POLICY "Admins can view daily focus settings"
ON public.daily_focus_settings
FOR SELECT
USING (is_admin(auth.uid()));

-- Admins can insert daily focus settings
CREATE POLICY "Admins can insert daily focus settings"
ON public.daily_focus_settings
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Admins can update daily focus settings
CREATE POLICY "Admins can update daily focus settings"
ON public.daily_focus_settings
FOR UPDATE
USING (is_admin(auth.uid()));

-- Admins can delete daily focus settings
CREATE POLICY "Admins can delete daily focus settings"
ON public.daily_focus_settings
FOR DELETE
USING (is_admin(auth.uid()));

-- Everyone can view published daily focus (for the daily focus page)
CREATE POLICY "Anyone can view daily focus"
ON public.daily_focus_settings
FOR SELECT
USING (true);

-- Create categories table for managing menu categories
CREATE TABLE public.menu_categories (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  name_french TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '🍽️',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view active categories
CREATE POLICY "Anyone can view categories"
ON public.menu_categories
FOR SELECT
USING (true);

-- Admins can manage categories
CREATE POLICY "Admins can insert categories"
ON public.menu_categories
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update categories"
ON public.menu_categories
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete categories"
ON public.menu_categories
FOR DELETE
USING (is_admin(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_daily_focus_settings_updated_at
BEFORE UPDATE ON public.daily_focus_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_categories_updated_at
BEFORE UPDATE ON public.menu_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();