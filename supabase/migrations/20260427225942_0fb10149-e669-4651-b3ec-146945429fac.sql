-- Update assign_role_from_invitation to read from staff_invitations (the table actually used)
CREATE OR REPLACE FUNCTION public.assign_role_from_invitation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  invite_record RECORD;
BEGIN
  -- First check staff_invitations (current invite system)
  SELECT * INTO invite_record FROM public.staff_invitations
  WHERE lower(email) = lower(NEW.email)
    AND status = 'pending'
    AND accepted_at IS NULL
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, invite_record.invited_role::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    UPDATE public.staff_invitations
    SET status = 'accepted', accepted_at = now()
    WHERE id = invite_record.id;
  ELSE
    -- Fallback: check legacy invitations table
    SELECT * INTO invite_record FROM public.invitations
    WHERE lower(email) = lower(NEW.email)
      AND accepted_at IS NULL
      AND expires_at > now()
    LIMIT 1;

    IF FOUND THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, invite_record.role)
      ON CONFLICT (user_id, role) DO NOTHING;

      UPDATE public.invitations
      SET accepted_at = now()
      WHERE id = invite_record.id;
    ELSE
      -- No invitation found: assign default 'employee' role so user isn't role-less
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'employee'::public.app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Create the auth.users triggers that were missing
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_role_from_invitation();

-- Backfill: assign roles to existing users who accepted invites but never got a role
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, si.invited_role::public.app_role
FROM auth.users u
JOIN public.staff_invitations si ON lower(si.email) = lower(u.email)
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE ur.id IS NULL
  AND si.invited_role IN ('admin','employee','server','bartender','server_assistant')
ON CONFLICT (user_id, role) DO NOTHING;

-- Mark those staff_invitations as accepted
UPDATE public.staff_invitations si
SET status = 'accepted', accepted_at = COALESCE(si.accepted_at, now())
FROM auth.users u
WHERE lower(si.email) = lower(u.email)
  AND si.status = 'pending';