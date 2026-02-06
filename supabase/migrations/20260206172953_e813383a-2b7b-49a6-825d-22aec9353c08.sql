
-- Create allergen_modifications table
CREATE TABLE public.allergen_modifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id TEXT NOT NULL,
  allergen_type TEXT NOT NULL,
  can_remove BOOLEAN NOT NULL DEFAULT false,
  substitution_notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(menu_item_id, allergen_type)
);

-- Enable RLS
ALTER TABLE public.allergen_modifications ENABLE ROW LEVEL SECURITY;

-- Admins can manage
CREATE POLICY "Admins can insert allergen modifications"
ON public.allergen_modifications FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update allergen modifications"
ON public.allergen_modifications FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete allergen modifications"
ON public.allergen_modifications FOR DELETE
USING (is_admin(auth.uid()));

-- Anyone authenticated can view (staff needs to read these)
CREATE POLICY "Anyone can view allergen modifications"
ON public.allergen_modifications FOR SELECT
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_allergen_modifications_updated_at
BEFORE UPDATE ON public.allergen_modifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
