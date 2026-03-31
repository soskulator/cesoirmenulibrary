import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "https://esm.sh/resend@4.0.0";

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

interface SendResultsRequest {
  attemptId: string;
  employeeEmail: string;
  employeeName: string;
  testName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "lead_admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Only lead admins can send test results" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const resend = new Resend(resendApiKey);

    const {
      attemptId,
      employeeEmail,
      employeeName,
      testName,
      score,
      totalQuestions,
      percentage,
    }: SendResultsRequest = await req.json();

    const senderDomain =
      Deno.env.get("RESEND_SENDER_DOMAIN") || "cesoirmenusnaples.com";
    const fromAddress = `Ce Soir Tests <no-reply@${senderDomain}>`;

    console.log(
      `Sending test results to ${employeeEmail} for attempt ${attemptId} from ${fromAddress}`
    );

    const passingScore = 70;
    const passed = percentage >= passingScore;
    const passStatus = passed ? "PASSED" : "DID NOT PASS";
    const passColor = passed ? "#2d8a4e" : "#c43e3e";
    const passIcon = passed ? "&#10003;" : "&#10007;";
    const displayName = escapeHtml(
      employeeName && employeeName !== "Unknown"
        ? employeeName
        : "Team Member"
    );
    const safeTestName = escapeHtml(testName);

    const { error: emailError } = await resend.emails.send({
      from: fromAddress,
      to: [employeeEmail],
      subject: `Your ${testName} Results — ${passed ? "Passed ✅" : "Needs Review ⚠️"}`,
      html: buildEmailHtml({
        preheader: `Your ${testName} results are in: ${percentage}% — ${passStatus}`,
        headline: "Your Test Results",
        body: `
          <p style="color: #4A3728; line-height: 1.8; margin: 0 0 24px; font-size: 15px; font-family: Georgia, 'Times New Roman', serif;">
            Hi ${displayName}, your manager has reviewed your test. Here are your results:
          </p>

          <!-- Score Card -->
          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background: #FFFFFF; border: 1px solid #DDD4C8;">
            <tr>
              <td colspan="2" style="background-color: ${passed ? "#f0faf4" : "#fdf4f4"}; padding: 20px 24px; text-align: center; border-bottom: 1px solid #DDD4C8;">
                <span style="display: inline-block; font-size: 36px; font-weight: 700; color: ${passColor}; font-family: Georgia, 'Times New Roman', serif; line-height: 1;">${percentage}%</span>
                <br />
                <span style="display: inline-block; margin-top: 6px; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: ${passColor}; font-family: 'Helvetica Neue', Arial, sans-serif;">
                  ${passIcon}&nbsp; ${passStatus}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 24px; color: #6B5244; font-size: 14px; font-family: Georgia, serif; border-bottom: 1px solid #EDE8E1; width: 50%;">Test</td>
              <td style="padding: 14px 24px; color: #1C1410; font-weight: 600; text-align: right; font-size: 14px; font-family: Georgia, serif; border-bottom: 1px solid #EDE8E1;">${safeTestName}</td>
            </tr>
            <tr>
              <td style="padding: 14px 24px; color: #6B5244; font-size: 14px; font-family: Georgia, serif;">Score</td>
              <td style="padding: 14px 24px; color: #1C1410; font-weight: 600; text-align: right; font-size: 14px; font-family: Georgia, serif;">${score} / ${totalQuestions}</td>
            </tr>
          </table>

          <p style="color: #6B5244; line-height: 1.7; margin: 28px 0 0; font-size: 14px; font-family: Georgia, 'Times New Roman', serif; text-align: center;">
            ${
              passed
                ? "Congratulations on passing! Keep up the great work."
                : "Please review the study materials and speak with your manager about next steps."
            }
          </p>
        `,
        ctaText: "Go to Training Portal",
        ctaLink: "https://cesoirmenulibrary.lovable.app",
      }),
    });

    if (emailError) {
      console.error("Error sending results email:", emailError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to send email" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Results email sent successfully to", employeeEmail);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-test-results:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

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