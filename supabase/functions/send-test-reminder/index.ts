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

interface ReminderRequest {
  email: string;
  fullName: string;
  missingTests: string[];
}

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

    // Admin role check - only admins can send reminders
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: roleData } = await supabaseAdmin.from('user_roles').select('role').eq('user_id', callerId).single();
    if (!roleData || (roleData.role !== 'admin' && roleData.role !== 'lead_admin')) {
      return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { email, fullName, missingTests }: ReminderRequest = await req.json();

    if (!email || !missingTests || missingTests.length === 0) {
      throw new Error("Missing required fields: email and missingTests");
    }

    // Use full_name if provided, fall back to "there" if not set or "Unknown"
    const displayName = (fullName && fullName !== 'Unknown') ? fullName : null;
    const greeting = displayName ? `Hi ${displayName},` : "Hi there,";
    const testList = missingTests.map(t => `<li style="margin-bottom: 8px; color: #4a4a4a;">${t}</li>`).join("");

    console.log(`Sending test reminder to ${email} for tests: ${missingTests.join(", ")} (requested by admin ${callerId})`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Ce Soir <noreply@cesoirmenusnaples.com>",
        to: [email],
        subject: "Reminder: Complete Your Required Training Tests",
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
                  Training Reminder
                </h2>
                <p style="color: #4a4a4a; line-height: 1.7; margin: 0 0 20px; font-size: 16px;">${greeting}</p>
                <p style="color: #4a4a4a; line-height: 1.7; margin: 0 0 20px; font-size: 16px;">
                  You have outstanding training tests that need to be completed. Please log in and finish the following:
                </p>
                <ul style="padding-left: 20px; margin: 0 0 32px; font-size: 16px; line-height: 1.8;">${testList}</ul>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${PUBLISHED_URL}" style="display: inline-block; background-color: #C06C46; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 4px; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                    Go to Training Portal
                  </a>
                </div>
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

    console.log("Test reminder email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, ...emailData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-test-reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
