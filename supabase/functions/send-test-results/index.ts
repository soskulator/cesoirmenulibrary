import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function escapeHtml(unsafe: string): string {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
  if (req.method === 'OPTIONS') {
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

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const userId = user.id;

    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'lead_admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Only lead admins can send test results' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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

    const senderDomain = Deno.env.get('RESEND_SENDER_DOMAIN') || 'cesoirmenusnaples.com';
    const fromAddress = `Ce Soir Tests <no-reply@${senderDomain}>`;

    console.log(`Sending test results to ${employeeEmail} for attempt ${attemptId} from ${fromAddress}`);

    const passingScore = 70;
    const passed = percentage >= passingScore;
    const passStatus = passed ? 'PASSED' : 'DID NOT PASS';
    const passColor = passed ? '#2d8a4e' : '#c43e3e';
    const passIcon = passed ? '&#10003;' : '&#10007;';
    const displayName = escapeHtml((employeeName && employeeName !== 'Unknown') ? employeeName : 'Team Member');
    const safeTestName = escapeHtml(testName);

    const { error: emailError } = await resend.emails.send({
      from: fromAddress,
      to: [employeeEmail],
      subject: `Your ${testName} Results — ${passed ? 'Passed ✅' : 'Needs Review ⚠️'}`,
      html: buildEmailHtml({
        preheader: `Your ${testName} results are in: ${percentage}% — ${passStatus}`,
        headline: "Your Test Results",
        body: `
          <p style="color: #5a5249; line-height: 1.8; margin: 0 0 24px; font-size: 16px; font-family: Georgia, 'Times New Roman', serif;">
            Hi ${displayName}, your manager has reviewed your test. Here are your results:
          </p>

          <!-- Score Card -->
          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background: #ffffff; border-radius: 8px; border: 1px solid #e8e0d8; overflow: hidden;">
            <!-- Score Header -->
            <tr>
              <td colspan="2" style="background: linear-gradient(135deg, ${passColor}15 0%, ${passColor}08 100%); padding: 20px 24px; text-align: center; border-bottom: 1px solid #e8e0d8;">
                <span style="display: inline-block; font-size: 36px; font-weight: 700; color: ${passColor}; font-family: 'Playfair Display', Georgia, serif; line-height: 1;">${percentage}%</span>
                <br />
                <span style="display: inline-block; margin-top: 6px; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: ${passColor}; font-family: 'Helvetica Neue', Arial, sans-serif;">
                  ${passIcon}&nbsp; ${passStatus}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 24px; color: #7a7067; font-size: 14px; font-family: Georgia, serif; border-bottom: 1px solid #f0ebe6; width: 50%;">Test</td>
              <td style="padding: 14px 24px; color: #2C241E; font-weight: 600; text-align: right; font-size: 14px; font-family: Georgia, serif; border-bottom: 1px solid #f0ebe6;">${safeTestName}</td>
            </tr>
            <tr>
              <td style="padding: 14px 24px; color: #7a7067; font-size: 14px; font-family: Georgia, serif;">Score</td>
              <td style="padding: 14px 24px; color: #2C241E; font-weight: 600; text-align: right; font-size: 14px; font-family: Georgia, serif;">${score} / ${totalQuestions}</td>
            </tr>
          </table>

          <p style="color: #7a7067; line-height: 1.7; margin: 28px 0 0; font-size: 15px; font-family: Georgia, 'Times New Roman', serif; text-align: center;">
            ${passed
              ? 'Congratulations on passing! Keep up the great work.'
              : 'Please review the study materials and speak with your manager about next steps.'}
          </p>
        `,
        ctaText: "Go to Training Portal",
        ctaLink: "https://cesoirmenulibrary.lovable.app",
      }),
    });

    if (emailError) {
      console.error('Error sending results email:', emailError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to send email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Results email sent successfully to', employeeEmail);
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in send-test-results:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

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
