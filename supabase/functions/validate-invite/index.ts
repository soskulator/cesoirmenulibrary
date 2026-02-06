import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_ATTEMPTS = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(clientIP);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (record.count >= MAX_ATTEMPTS) return false;
  record.count++;
  return true;
}

const ROLE_LABELS: Record<string, string> = {
  server: "Server",
  bartender: "Bartender",
  server_assistant: "Server Assistant",
  admin: "Admin",
  lead_admin: "Lead Admin",
  employee: "Staff",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ valid: false, reason: 'rate_limited', error: 'Too many attempts. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    // Support both ?token= (old invitations table) and ?invitation= (staff_invitations table)
    const invitationCode = body.invitationCode || null;
    const legacyToken = body.token || null;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle new staff_invitations flow
    if (invitationCode) {
      if (typeof invitationCode !== 'string' || !/^[a-f0-9]{32}$/i.test(invitationCode)) {
        return new Response(
          JSON.stringify({ valid: false, reason: 'invalid', error: 'Invalid invitation link.' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase
        .from('staff_invitations')
        .select('id, email, full_name, invited_role, status, expires_at, accepted_at')
        .eq('invitation_code', invitationCode)
        .maybeSingle();

      if (error) {
        console.error('DB error validating invitation:', error);
        return new Response(
          JSON.stringify({ valid: false, reason: 'error', error: 'Unable to validate invitation.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!data) {
        console.log(`Invalid invitation code attempt from IP: ${clientIP}`);
        return new Response(
          JSON.stringify({ valid: false, reason: 'not_found', error: 'Invalid invitation link.' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (data.status === 'revoked') {
        return new Response(
          JSON.stringify({ valid: false, reason: 'revoked', error: 'This invitation has been revoked.' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (data.status === 'accepted' || data.accepted_at) {
        return new Response(
          JSON.stringify({ valid: false, reason: 'accepted', error: 'This invitation has already been used.' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (new Date(data.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ valid: false, reason: 'expired', error: 'This invitation has expired. Please contact your manager for a new one.' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Valid invitation verified for: ${data.email.substring(0, 3)}***`);

      return new Response(
        JSON.stringify({
          valid: true,
          email: data.email,
          fullName: data.full_name,
          role: data.invited_role,
          roleName: ROLE_LABELS[data.invited_role] || data.invited_role,
          invitationId: data.id,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Legacy token flow (old invitations table)
    if (legacyToken) {
      if (typeof legacyToken !== 'string' || !/^[a-f0-9]{64}$/i.test(legacyToken)) {
        return new Response(
          JSON.stringify({ valid: false, error: 'Invalid invitation link.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase
        .from('invitations')
        .select('email, role, expires_at, accepted_at')
        .eq('token', legacyToken)
        .maybeSingle();

      if (error) {
        return new Response(
          JSON.stringify({ valid: false, error: 'Unable to validate invitation.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!data) {
        return new Response(
          JSON.stringify({ valid: false, error: 'This invitation link is invalid.' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (data.accepted_at) {
        return new Response(
          JSON.stringify({ valid: false, error: 'This invitation has already been used.' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (new Date(data.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ valid: false, error: 'This invitation link has expired.' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ valid: true, email: data.email, role: data.role }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ valid: false, error: 'No invitation code provided.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error in validate-invite:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Unable to validate invitation.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
