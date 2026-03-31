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
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerId = claimsData.claims.sub;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .single();
    if (
      !roleData ||
      (roleData.role !== "admin" && roleData.role !== "lead_admin")
    ) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const {
      email,
      fullName,
      invitedRole,
      invitationCode,
      inviterName,
    }: InvitationRequest = await req.json();

    if (!email || !invitationCode) {
      throw new Error("Missing required fields: email and invitationCode");
    }

    const roleName = ROLE_LABELS[invitedRole] || escapeHtml(invitedRole);
    const inviteLink = `${PUBLISHED_URL}/auth?invitation=${encodeURIComponent(invitationCode)}`;
    const greeting = fullName
      ? `Hi ${escapeHtml(fullName)},`
      : "Hello,";

    console.log(
      `Sending staff invitation to ${email} for role ${invitedRole} (requested by admin ${callerId})`
    );

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
        html: buildEmailHtml({
          preheader: "You've been invited to join the Ce Soir team",
          headline: "You're Invited",
          body: `
            <p style="color: #4A3728; line-height: 1.8; margin: 0 0 20px; font-size: 15px; font-family: Georgia, 'Times New Roman', serif;">${greeting}</p>
            <p style="color: #4A3728; line-height: 1.8; margin: 0 0 20px; font-size: 15px; font-family: Georgia, 'Times New Roman', serif;">
              You have been invited by <strong style="color: #2C241E; font-family: Georgia, 'Times New Roman', serif;">${escapeHtml(inviterName)}</strong> to join the Ce Soir staff training portal as a <strong style="color: #2C241E; font-family: Georgia, 'Times New Roman', serif;">${roleName}</strong>.
            </p>
            <p style="color: #6B5244; line-height: 1.8; margin: 0; font-size: 14px; font-family: Georgia, 'Times New Roman', serif; text-align: center;">
              Access our menu library, training materials, and quizzes to master the Ce Soir dining experience.
            </p>
          `,
          ctaText: "Create Your Account",
          ctaLink: inviteLink,
          showFallbackLink: true,
          footnote:
            "This invitation link will expire in 7 days. If you were not expecting this, please disregard.",
        }),
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);

// ─── Shared Email Template Builder ───────────────────────────────────────────

interface EmailOptions {
  preheader: string;
  recipientName?: string;
  headline: string;
  body: string;
  ctaText?: string;
  ctaLink?: string;
  showFallbackLink?: boolean;
  footnote?: string;
}

function buildEmailHtml(opts: EmailOptions): string {
  const cta =
    opts.ctaText && opts.ctaLink
      ? `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 36px auto 0;">
      <tr>
        <td align="center" style="background-color: #8B5E3C; border-radius: 2px;">
          <a href="${opts.ctaLink}"
            style="display: inline-block; color: #F5EFE4; text-decoration: none; padding: 15px 48px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 2.5px; font-family: 'Helvetica Neue', Arial, sans-serif; mso-padding-alt: 0; text-underline-color: #8B5E3C;">
            <!--[if mso]>&nbsp;&nbsp;&nbsp;&nbsp;<![endif]-->${opts.ctaText}<!--[if mso]>&nbsp;&nbsp;&nbsp;&nbsp;<![endif]-->
          </a>
        </td>
      </tr>
    </table>
  `
      : "";

  const fallback =
    opts.showFallbackLink && opts.ctaLink
      ? `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-top: 32px;">
      <tr>
        <td style="border-top: 1px solid #DDD4C8; padding-top: 24px;">
          <p style="color: #9A8880; font-size: 11px; line-height: 1.6; margin: 0 0 6px; text-align: center; font-family: 'Helvetica Neue', Arial, sans-serif;">
            If the button does not work, copy and paste this link into your browser:
          </p>
          <p style="margin: 0; text-align: center;">
            <a href="${opts.ctaLink}" style="color: #8B5E3C; font-size: 11px; word-break: break-all; font-family: 'Helvetica Neue', Arial, sans-serif; text-decoration: underline;">${opts.ctaLink}</a>
          </p>
        </td>
      </tr>
    </table>
  `
      : "";

  const footnoteHtml = opts.footnote
    ? `
    <p style="color: #9A8880; font-size: 11px; line-height: 1.6; margin: 24px 0 0; text-align: center; font-family: 'Helvetica Neue', Arial, sans-serif;">
      ${opts.footnote}
    </p>
  `
    : "";

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Ce Soir</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <style>
    table { border-collapse: collapse; }
    td, th { font-family: Georgia, serif; }
    .btn-fallback a { padding: 15px 48px !important; }
  </style>
  <![endif]-->
  <style type="text/css">
    body { margin: 0 !important; padding: 0 !important; background-color: #F0EBE3 !important; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .email-body-pad { padding: 32px 24px 24px !important; }
      .email-header-pad { padding: 32px 24px 28px !important; }
      .email-footer-pad { padding: 20px 24px !important; }
      .wordmark { font-size: 26px !important; letter-spacing: 6px !important; }
      .submark { font-size: 9px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F0EBE3;">

  <div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #F0EBE3; mso-hide: all;">
    ${opts.preheader}&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F0EBE3;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" class="email-container" style="max-width: 600px; width: 100%;">

          <tr>
            <td class="email-header-pad" style="background-color: #1C1410; padding: 40px 48px 32px; text-align: center;">
              <div class="wordmark" style="font-family: Georgia, 'Times New Roman', serif; font-size: 30px; font-weight: 400; letter-spacing: 8px; color: #C8956A; text-transform: uppercase; line-height: 1; mso-line-height-rule: exactly;">
                CE SOIR
              </div>
              <div class="submark" style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; letter-spacing: 4px; color: #6B5040; text-transform: uppercase; margin-top: 8px; mso-line-height-rule: exactly;">
                NAPLES &nbsp;&#183;&nbsp; FLORIDA
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #8B5E3C; height: 3px; font-size: 3px; line-height: 3px;">&nbsp;</td>
          </tr>

          <tr>
            <td class="email-body-pad" style="background-color: #FAF8F4; padding: 44px 48px 32px;">

              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                <tr>
                  <td style="width: 40%; height: 1px; background-color: #C8956A; opacity: 0.4; font-size: 0; line-height: 0;">&nbsp;</td>
                  <td style="width: 20px; text-align: center; font-family: Georgia, serif; font-size: 14px; color: #8B5E3C; padding: 0 8px;">&#9670;</td>
                  <td style="width: 40%; height: 1px; background-color: #C8956A; opacity: 0.4; font-size: 0; line-height: 0;">&nbsp;</td>
                </tr>
              </table>

              <h1 style="color: #1C1410; margin: 0 0 28px; font-size: 28px; font-weight: 400; font-family: Georgia, 'Times New Roman', serif; text-align: center; letter-spacing: 1px; line-height: 1.3; mso-line-height-rule: exactly;">
                ${opts.headline}
              </h1>

              ${opts.body}
              ${cta}
              ${fallback}
              ${footnoteHtml}

            </td>
          </tr>

          <tr>
            <td class="email-footer-pad" style="background-color: #1C1410; padding: 24px 48px; text-align: center;">
              <p style="color: #8B5E3C; font-size: 10px; margin: 0 0 6px; letter-spacing: 3px; text-transform: uppercase; font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 600; mso-line-height-rule: exactly;">
                Ce Soir Naples
              </p>
              <p style="color: #5A4A3A; font-size: 11px; margin: 0 0 8px; font-family: Georgia, 'Times New Roman', serif; line-height: 1.6; mso-line-height-rule: exactly;">
                492 Bayfront Pl, Naples, FL 34102
              </p>
              <p style="margin: 0;">
                <a href="https://cesoirnaples.com" style="color: #8B5E3C; font-size: 11px; text-decoration: none; font-family: Georgia, 'Times New Roman', serif; border-bottom: 1px solid #8B5E3C;">
                  cesoirnaples.com
                </a>
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