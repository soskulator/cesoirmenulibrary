-- ============================================================
-- TABLE 1: staff_invitations
-- ============================================================
CREATE TABLE public.staff_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  full_name TEXT,
  invited_role TEXT NOT NULL,
  invited_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  invitation_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Validation trigger for invited_role
CREATE OR REPLACE FUNCTION public.validate_staff_invitation_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.invited_role NOT IN ('admin', 'employee', 'server', 'bartender', 'server_assistant') THEN
    RAISE EXCEPTION 'Invalid invited_role: %', NEW.invited_role;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_staff_invitation_role
BEFORE INSERT OR UPDATE ON public.staff_invitations
FOR EACH ROW EXECUTE FUNCTION public.validate_staff_invitation_role();

-- Validation trigger for status
CREATE OR REPLACE FUNCTION public.validate_staff_invitation_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('pending', 'accepted', 'expired', 'revoked') THEN
    RAISE EXCEPTION 'Invalid status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_staff_invitation_status
BEFORE INSERT OR UPDATE ON public.staff_invitations
FOR EACH ROW EXECUTE FUNCTION public.validate_staff_invitation_status();

-- RLS
ALTER TABLE public.staff_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view invitations"
ON public.staff_invitations FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can create invitations"
ON public.staff_invitations FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update invitations"
ON public.staff_invitations FOR UPDATE
USING (is_admin(auth.uid()));

-- ============================================================
-- TABLE 2: role_audit_log
-- ============================================================
CREATE TABLE public.role_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  changed_by UUID NOT NULL,
  old_role TEXT,
  new_role TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.role_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lead admins can view audit log"
ON public.role_audit_log FOR SELECT
USING (has_role(auth.uid(), 'lead_admin'));

CREATE POLICY "Admins can insert audit entries"
ON public.role_audit_log FOR INSERT
WITH CHECK (is_admin(auth.uid()));