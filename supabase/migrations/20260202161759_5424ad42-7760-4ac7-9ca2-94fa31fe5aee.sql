-- Create function to check if user has beverage access (not a server assistant)
-- Using text casting to handle enum values safely
CREATE OR REPLACE FUNCTION public.has_beverage_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
    AND role::text IN ('lead_admin', 'admin', 'server', 'bartender', 'employee')
  )
$$;

-- Update is_admin to ensure it handles roles correctly
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text IN ('lead_admin', 'admin')
  )
$$;