import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const PUBLISHED_URL = "https://cesoirmenulibrary.lovable.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeHtml(unsafe: string): string {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface InvitationRequest {
  email: string;
  fullName: string | null;
  invitedRole: string;
  invitationCode: string;
  inviterName: string;
}

const ROLE_LABELS: Record<string, string> = {
  server: "Server",
  bartender: "Bartender",
  server_assistant: "Server Assistant",
  admin: "Admin",
  lead_admin: "Lead Admin",
  employee: "Staff",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const callerId = claimsData.claims.sub;

    // Admin role check
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: roleData } = await supabaseAdmin.from('user_roles').select('role').eq('user_id', callerId).single();
    if (!roleData || (roleData.role !== 'admin' && roleData.role !== 'lead_admin')) {
      return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { email, fullName, invitedRole, invitationCode, inviterName }: InvitationRequest = await req.json();

    if (!email || !invitationCode) {
      throw new Error("Missing required fields: email and invitationCode");
    }

    const roleName = ROLE_LABELS[invitedRole] || escapeHtml(invitedRole);
    const inviteLink = `${PUBLISHED_URL}/auth?invitation=${encodeURIComponent(invitationCode)}`;
    const greeting = fullName ? `Hi ${escapeHtml(fullName)},` : "Hello,";

    console.log(`Sending staff invitation to ${email} for role ${invitedRole} (requested by admin ${callerId})`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Ce Soir <noreply@cesoirmenusnaples.com>",
        to: [email],
        subject: "You're invited to join Ce Soir's Training Platform",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Georgia', serif; background-color: #2C241E; margin: 0; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #F9F7F5; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #2C241E; padding: 40px 30px; text-align: center;">
                <img src="https://cchhvuotfdxswpxwnxgv.supabase.co/storage/v1/object/public/email-assets/cesoir-logo.png?v=1" alt="Ce Soir" width="180" style="display: block; margin: 0 auto;" />
              </div>
              <div style="padding: 40px 30px;">
                <h2 style="color: #2C241E; margin: 0 0 24px; font-size: 26px; font-weight: 500; font-family: 'Playfair Display', Georgia, serif; text-align: center;">
                  You're Invited to Join Our Team
                </h2>
                <p style="color: #4a4a4a; line-height: 1.7; margin: 0 0 20px; font-size: 16px;">${greeting}</p>
                <p style="color: #4a4a4a; line-height: 1.7; margin: 0 0 20px; font-size: 16px;">
                  You have been invited by <strong style="color: #C06C46;">${inviterName}</strong> to join the 
                  <strong style="color: #C06C46;">Ce Soir</strong> staff training portal as 
                  <strong style="color: #C06C46;">${roleName}</strong>.
                </p>
                <p style="color: #4a4a4a; line-height: 1.7; margin: 0 0 32px; font-size: 16px;">
                  Access our comprehensive menu library, training materials, and quizzes to master the Ce Soir dining experience.
                </p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${inviteLink}" style="display: inline-block; background-color: #C06C46; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 4px; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                    Create Your Account
                  </a>
                </div>
                <div style="border-top: 1px solid #e5e5e5; margin: 32px 0 24px;"></div>
                <p style="color: #888; font-size: 13px; line-height: 1.6; margin: 0; text-align: center;">
                  If the button doesn't work, copy and paste this link into your browser:
                </p>
                <p style="margin: 8px 0 0; text-align: center;">
                  <a href="${inviteLink}" style="color: #C06C46; font-size: 13px; word-break: break-all;">${inviteLink}</a>
                </p>
                <p style="color: #888; font-size: 12px; line-height: 1.5; margin: 24px 0 0; text-align: center;">
                  This invitation link will expire in 7 days.
                </p>
              </div>
              <div style="background-color: #2C241E; padding: 24px 30px; text-align: center;">
                <p style="color: #D99572; font-size: 12px; margin: 0; letter-spacing: 0.5px;">
                  © 2026 Ce Soir Naples · 492 Bayfront Pl, Naples FL, 34102
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", emailData);
      throw new Error(emailData.message || "Failed to send email");
    }

    console.log("Staff invitation email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, ...emailData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-staff-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
