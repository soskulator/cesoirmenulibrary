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
    // Auth check — only lead admins can send results
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

    // Verify lead admin role
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

    // Determine sender - use verified domain if available
    const senderDomain = Deno.env.get('RESEND_SENDER_DOMAIN') || 'cesoirmenusnaples.com';
    const fromAddress = `Ce Soir Tests <no-reply@${senderDomain}>`;

    console.log(`Sending test results to ${employeeEmail} for attempt ${attemptId} from ${fromAddress}`);

    const passingScore = 70;
    const passed = percentage >= passingScore;
    const passStatus = passed ? 'PASSED ✅' : 'DID NOT PASS ⚠️';
    const passColor = passed ? '#22c55e' : '#ef4444';
    const displayName = (employeeName && employeeName !== 'Unknown') ? employeeName : 'Team Member';

    const { error: emailError } = await resend.emails.send({
      from: fromAddress,
      to: [employeeEmail],
      subject: `Your ${testName} Results — ${passStatus}`,
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
                Your Test Results
              </h2>
              <p style="color: #4a4a4a; line-height: 1.7; margin: 0 0 20px; font-size: 16px;">
                Hi ${displayName}, your manager has reviewed your test. Here are your results:
              </p>
              <div style="background: #ffffff; border-radius: 8px; padding: 24px; margin: 24px 0; border: 1px solid #e8e0d8;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; color: #7a7067; font-size: 14px; border-bottom: 1px solid #f0ebe6;">Test</td>
                    <td style="padding: 12px 0; color: #2C241E; font-weight: 600; text-align: right; border-bottom: 1px solid #f0ebe6;">${testName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #7a7067; font-size: 14px; border-bottom: 1px solid #f0ebe6;">Score</td>
                    <td style="padding: 12px 0; color: #2C241E; font-weight: 600; text-align: right; border-bottom: 1px solid #f0ebe6;">${score} / ${totalQuestions}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #7a7067; font-size: 14px; border-bottom: 1px solid #f0ebe6;">Percentage</td>
                    <td style="padding: 12px 0; color: ${passColor}; font-weight: 700; font-size: 20px; text-align: right; border-bottom: 1px solid #f0ebe6;">${percentage}%</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #7a7067; font-size: 14px;">Result</td>
                    <td style="padding: 12px 0; color: ${passColor}; font-weight: 700; text-align: right; font-size: 16px;">${passStatus}</td>
                  </tr>
                </table>
              </div>
              <p style="color: #4a4a4a; line-height: 1.7; margin: 24px 0 32px; font-size: 15px; text-align: center;">
                ${passed 
                  ? 'Congratulations on passing! Keep up the great work.' 
                  : 'Please review the study materials and speak with your manager about next steps.'}
              </p>
              <div style="text-align: center;">
                <a href="https://cesoirmenulibrary.lovable.app" style="display: inline-block; background-color: #C06C46; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 4px; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                  Go to Training Portal
                </a>
              </div>
            </div>
            <div style="background-color: #2C241E; padding: 24px 30px; text-align: center;">
              <p style="color: #D99572; font-size: 12px; margin: 0 0 4px; letter-spacing: 0.5px;">
                Ce Soir Naples · Staff Training Portal
              </p>
              <p style="color: #D99572; font-size: 11px; margin: 0; opacity: 0.7;">
                492 Bayfront Pl, Naples FL 34102 · cesoirnaples.com
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
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
