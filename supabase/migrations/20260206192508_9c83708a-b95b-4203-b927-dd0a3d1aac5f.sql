
-- Table to store configurable permissions per role
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  permission_key TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(role, permission_key)
);

-- Enable RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read permissions (needed for route guards)
CREATE POLICY "Authenticated users can read permissions"
  ON public.role_permissions FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can modify permissions
CREATE POLICY "Admins can insert permissions"
  ON public.role_permissions FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update permissions"
  ON public.role_permissions FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete permissions"
  ON public.role_permissions FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_role_permissions_updated_at
  BEFORE UPDATE ON public.role_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default permissions matching current hardcoded behavior
-- Permission keys: page:wine-list, page:spirits, page:cocktails, page:cocktail-flashcards,
--   page:categories, page:flashcards, page:daily-focus, page:allergy,
--   test:knowledge-server, test:knowledge-sa, quiz:wine, quiz:spirits, quiz:food, quiz:allergy

-- Server: full access
INSERT INTO public.role_permissions (role, permission_key, is_enabled) VALUES
  ('server', 'page:categories', true),
  ('server', 'page:wine-list', true),
  ('server', 'page:spirits', true),
  ('server', 'page:cocktails', true),
  ('server', 'page:flashcards', true),
  ('server', 'page:cocktail-flashcards', true),
  ('server', 'page:daily-focus', true),
  ('server', 'page:allergy', true),
  ('server', 'test:knowledge-server', true),
  ('server', 'test:knowledge-sa', false),
  ('server', 'quiz:wine', true),
  ('server', 'quiz:spirits', true),
  ('server', 'quiz:food', true),
  ('server', 'quiz:allergy', true);

-- Bartender: full access
INSERT INTO public.role_permissions (role, permission_key, is_enabled) VALUES
  ('bartender', 'page:categories', true),
  ('bartender', 'page:wine-list', true),
  ('bartender', 'page:spirits', true),
  ('bartender', 'page:cocktails', true),
  ('bartender', 'page:flashcards', true),
  ('bartender', 'page:cocktail-flashcards', true),
  ('bartender', 'page:daily-focus', true),
  ('bartender', 'page:allergy', true),
  ('bartender', 'test:knowledge-server', true),
  ('bartender', 'test:knowledge-sa', false),
  ('bartender', 'quiz:wine', true),
  ('bartender', 'quiz:spirits', true),
  ('bartender', 'quiz:food', true),
  ('bartender', 'quiz:allergy', true);

-- Server Assistant: no beverage access
INSERT INTO public.role_permissions (role, permission_key, is_enabled) VALUES
  ('server_assistant', 'page:categories', true),
  ('server_assistant', 'page:wine-list', false),
  ('server_assistant', 'page:spirits', false),
  ('server_assistant', 'page:cocktails', false),
  ('server_assistant', 'page:flashcards', true),
  ('server_assistant', 'page:cocktail-flashcards', false),
  ('server_assistant', 'page:daily-focus', true),
  ('server_assistant', 'page:allergy', true),
  ('server_assistant', 'test:knowledge-server', false),
  ('server_assistant', 'test:knowledge-sa', true),
  ('server_assistant', 'quiz:wine', false),
  ('server_assistant', 'quiz:spirits', false),
  ('server_assistant', 'quiz:food', true),
  ('server_assistant', 'quiz:allergy', true);

-- Employee (legacy): full access
INSERT INTO public.role_permissions (role, permission_key, is_enabled) VALUES
  ('employee', 'page:categories', true),
  ('employee', 'page:wine-list', true),
  ('employee', 'page:spirits', true),
  ('employee', 'page:cocktails', true),
  ('employee', 'page:flashcards', true),
  ('employee', 'page:cocktail-flashcards', true),
  ('employee', 'page:daily-focus', true),
  ('employee', 'page:allergy', true),
  ('employee', 'test:knowledge-server', true),
  ('employee', 'test:knowledge-sa', false),
  ('employee', 'quiz:wine', true),
  ('employee', 'quiz:spirits', true),
  ('employee', 'quiz:food', true),
  ('employee', 'quiz:allergy', true);
