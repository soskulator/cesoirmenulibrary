
CREATE TABLE public.dish_ingredients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id text NOT NULL,
  ingredient_name text NOT NULL,
  is_omittable boolean NOT NULL DEFAULT false,
  omit_note text,
  allergens text[],
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dish_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view dish ingredients"
  ON public.dish_ingredients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert dish ingredients"
  ON public.dish_ingredients FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update dish ingredients"
  ON public.dish_ingredients FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete dish ingredients"
  ON public.dish_ingredients FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_dish_ingredients_updated_at
  BEFORE UPDATE ON public.dish_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
