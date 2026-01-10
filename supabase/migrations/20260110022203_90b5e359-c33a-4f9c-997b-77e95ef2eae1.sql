-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create menu_items table for persistent storage
CREATE TABLE public.menu_items (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  name TEXT NOT NULL,
  short_description TEXT NOT NULL DEFAULT '',
  long_description TEXT NOT NULL DEFAULT '',
  ingredients_text TEXT NOT NULL DEFAULT '',
  prep_notes TEXT NOT NULL DEFAULT '',
  selling_points_text TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '/placeholder.svg',
  allergens TEXT[] NOT NULL DEFAULT '{}',
  questions JSONB NOT NULL DEFAULT '[]',
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Everyone can view published menu items (public menu)
CREATE POLICY "Anyone can view published menu items"
ON public.menu_items
FOR SELECT
USING (is_published = true);

-- Admins can view all menu items
CREATE POLICY "Admins can view all menu items"
ON public.menu_items
FOR SELECT
USING (is_admin(auth.uid()));

-- Admins can insert menu items
CREATE POLICY "Admins can insert menu items"
ON public.menu_items
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Admins can update menu items
CREATE POLICY "Admins can update menu items"
ON public.menu_items
FOR UPDATE
USING (is_admin(auth.uid()));

-- Admins can delete menu items
CREATE POLICY "Admins can delete menu items"
ON public.menu_items
FOR DELETE
USING (is_admin(auth.uid()));

-- Create index for faster category lookups
CREATE INDEX idx_menu_items_category ON public.menu_items(category_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_menu_items_updated_at
BEFORE UPDATE ON public.menu_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();