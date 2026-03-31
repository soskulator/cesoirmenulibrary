import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";

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

interface DesignUpdateEmailRequest {
  email: string;
  recipientName: string;
  subject: string;
  updateTitle: string;
  updateDescription: string;
  ctaText: string;
  ctaLink: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: roleData } = await supabaseAdmin.from('user_roles').select('role').eq('user_id', callerId).single();
    if (!roleData || (roleData.role !== 'admin' && roleData.role !== 'lead_admin')) {
      return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const {
      email,
      recipientName,
      subject,
      updateTitle,
      updateDescription,
      ctaText,
      ctaLink
    }: DesignUpdateEmailRequest = await req.json();

    if (!email || !recipientName || !subject || !updateTitle || !ctaLink) {
      throw new Error("Missing required fields");
    }

    console.log(`Sending design update email to ${email} (requested by admin ${callerId})`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Ce Soir <noreply@cesoirmenusnaples.com>",
        to: [email],
        subject: subject,
        html: buildEmailHtml({
          preheader: updateDescription || updateTitle,
          headline: escapeHtml(updateTitle),
          body: `
            <p style="color: #5a5249; line-height: 1.8; margin: 0 0 8px; font-size: 16px; font-family: Georgia, 'Times New Roman', serif; text-align: center;">
              Hi <strong style="color: #2C241E;">${escapeHtml(recipientName)}</strong>,
            </p>
            <p style="color: #7a7067; line-height: 1.8; margin: 16px 0 0; font-size: 15px; font-family: Georgia, 'Times New Roman', serif; text-align: center;">
              ${escapeHtml(updateDescription)}
            </p>
          `,
          ctaText: escapeHtml(ctaText),
          ctaLink: escapeHtml(ctaLink),
          showFallbackLink: true,
        }),
      }),
    });

    const emailData = await emailResponse.json();
    if (!emailResponse.ok) {
      console.error("Resend API error:", emailData);
      throw new Error(emailData.message || "Failed to send email");
    }

    console.log("Design update email sent successfully:", emailData);
    return new Response(JSON.stringify({ success: true, ...emailData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-design-update-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

// ─── Shared Email Template Builder ───────────────────────────────────────────

interface EmailOptions {
  preheader: string;
  headline: string;
  body: string;
  ctaText?: string;
  ctaLink?: string;
  showFallbackLink?: boolean;
  footnote?: string;
}

function buildEmailHtml(opts: EmailOptions): string {
  const cta = opts.ctaText && opts.ctaLink ? `
    <div style="text-align: center; margin: 36px 0 0;">
      <a href="${opts.ctaLink}" style="display: inline-block; background: linear-gradient(135deg, #C06C46 0%, #A8553A 100%); color: #ffffff; text-decoration: none; padding: 16px 52px; border-radius: 4px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; font-family: 'Helvetica Neue', Arial, sans-serif; box-shadow: 0 4px 16px rgba(192,108,70,0.3);">
        ${opts.ctaText}
      </a>
    </div>
  ` : '';

  const fallback = opts.showFallbackLink && opts.ctaLink ? `
    <div style="border-top: 1px solid #e8e0d8; margin: 36px 0 24px;"></div>
    <p style="color: #9a9089; font-size: 12px; line-height: 1.6; margin: 0; text-align: center; font-family: 'Helvetica Neue', Arial, sans-serif;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="margin: 8px 0 0; text-align: center;">
      <a href="${opts.ctaLink}" style="color: #C06C46; font-size: 12px; word-break: break-all; font-family: 'Helvetica Neue', Arial, sans-serif;">${opts.ctaLink}</a>
    </p>
  ` : '';

  const footnoteHtml = opts.footnote ? `
    <p style="color: #9a9089; font-size: 12px; line-height: 1.5; margin: 24px 0 0; text-align: center; font-family: 'Helvetica Neue', Arial, sans-serif;">
      ${opts.footnote}
    </p>
  ` : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ce Soir</title>
  <!--[if mso]><style>body,table,td{font-family:Georgia,serif!important}</style><![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #1E1915; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #1E1915;">
    ${opts.preheader}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #1E1915;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #FAF8F5; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.35);">
          <tr>
            <td style="background-color: #2C241E; padding: 44px 40px 36px; text-align: center;">
              <img src="https://cchhvuotfdxswpxwnxgv.supabase.co/storage/v1/object/public/email-assets/cesoir-logo.png?v=1" alt="Ce Soir" width="160" style="display: block; margin: 0 auto; max-width: 160px; height: auto;" />
            </td>
          </tr>
          <tr>
            <td style="height: 3px; background: linear-gradient(90deg, #2C241E 0%, #C06C46 20%, #D4956E 50%, #C06C46 80%, #2C241E 100%);"></td>
          </tr>
          <tr>
            <td style="padding: 44px 40px 20px;">
              <h1 style="color: #2C241E; margin: 0 0 8px; font-size: 30px; font-weight: 400; font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; text-align: center; letter-spacing: -0.5px;">
                ${opts.headline}
              </h1>
              <div style="text-align: center; margin: 16px 0 32px;">
                <span style="display: inline-block; width: 40px; height: 1px; background-color: #C06C46; vertical-align: middle;"></span>
                <span style="display: inline-block; width: 6px; height: 6px; border: 1px solid #C06C46; border-radius: 50%; margin: 0 8px; vertical-align: middle;"></span>
                <span style="display: inline-block; width: 40px; height: 1px; background-color: #C06C46; vertical-align: middle;"></span>
              </div>
              ${opts.body}
              ${cta}
              ${fallback}
              ${footnoteHtml}
            </td>
          </tr>
          <tr>
            <td style="background-color: #2C241E; padding: 28px 40px; text-align: center;">
              <p style="color: #C06C46; font-size: 11px; margin: 0 0 6px; letter-spacing: 2px; text-transform: uppercase; font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 600;">
                Ce Soir Naples
              </p>
              <p style="color: #7a6d62; font-size: 11px; margin: 0; font-family: Georgia, serif; line-height: 1.6;">
                492 Bayfront Pl, Naples FL 34102
              </p>
              <p style="margin: 10px 0 0;">
                <a href="https://cesoirnaples.com" style="color: #D4956E; font-size: 11px; text-decoration: none; font-family: Georgia, serif; border-bottom: 1px solid #D4956E33;">cesoirnaples.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
