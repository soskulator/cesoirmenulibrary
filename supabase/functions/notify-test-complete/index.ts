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

interface NotifyRequest {
  attemptId: string;
  employeeName: string;
  employeeEmail: string;
  testType: string;
  score: number;
  totalQuestions: number;
  percentage: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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

    const userId = claimsData.claims.sub;
    console.log(`Authenticated user ${userId} requesting test completion notification`);

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resend = new Resend(resendApiKey);

    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const body: NotifyRequest = await req.json();
    const { attemptId, testType } = body;

    // Validate numeric fields
    const score = Number(body.score);
    const totalQuestions = Number(body.totalQuestions);
    const percentage = Number(body.percentage);
    if (!attemptId || !testType || isNaN(score) || isNaN(totalQuestions) || isNaN(percentage)) {
      return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Fetch the caller's actual profile name from DB instead of trusting request body
    const { data: callerProfile } = await supabaseAdmin.from('profiles').select('full_name, email').eq('id', userId).maybeSingle();
    const employeeName = callerProfile?.full_name || body.employeeName || null;
    const employeeEmail = callerProfile?.email || body.employeeEmail || '';

    console.log(`Notifying lead admins about test completion: ${employeeName} (${testType})`);

    // Get all lead admin emails
    const { data: leadAdmins, error: leadAdminsError } = await supabaseAdmin
      .from('user_roles')
      .select('user_id')
      .eq('role', 'lead_admin');

    if (leadAdminsError) {
      console.error('Error fetching lead admins:', leadAdminsError);
      throw leadAdminsError;
    }

    if (!leadAdmins || leadAdmins.length === 0) {
      console.log('No lead admins found to notify');
      return new Response(
        JSON.stringify({ success: true, message: 'No lead admins to notify' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userIds = leadAdmins.map(la => la.user_id);
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    const adminEmails = profiles?.map(p => p.email).filter(Boolean) || [];

    if (adminEmails.length === 0) {
      console.log('No lead admin emails found');
      return new Response(
        JSON.stringify({ success: true, message: 'No lead admin emails found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sending notification to ${adminEmails.length} lead admin(s)`);

    // Look up test_name from test_configurations
    const FALLBACK_NAMES: Record<string, string> = {
      service_staff: 'Server & Bartender Test',
      server_assistant: 'Server Assistant Test',
    };
    let testTypeName = FALLBACK_NAMES[testType] ?? testType.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
    
    const { data: configRow } = await supabaseAdmin
      .from('test_configurations')
      .select('test_name')
      .eq('test_type', testType)
      .eq('is_active', true)
      .maybeSingle();
    if (configRow?.test_name) {
      testTypeName = configRow.test_name;
    }
    const displayName = (employeeName && employeeName !== 'Unknown') ? employeeName : employeeEmail;
    const passStatus = percentage >= 70 ? '✅ PASSED' : '⚠️ Needs Review';

    const senderDomain = Deno.env.get('RESEND_SENDER_DOMAIN') || 'cesoirmenusnaples.com';
    const fromAddress = `Ce Soir Tests <no-reply@${senderDomain}>`;

    const { error: emailError } = await resend.emails.send({
      from: fromAddress,
      to: adminEmails,
      subject: `[Action Required] ${displayName} completed ${testTypeName}`,
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
                FoH Test Completed
              </h2>
              <p style="color: #4a4a4a; line-height: 1.7; margin: 0 0 20px; font-size: 16px;">
                A team member has completed their knowledge test and requires your review.
              </p>
              <div style="background: #ffffff; border-radius: 8px; padding: 24px; margin: 24px 0; border: 1px solid #e8e0d8;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; color: #7a7067; font-size: 14px; border-bottom: 1px solid #f0ebe6;">Employee</td>
                    <td style="padding: 12px 0; color: #2C241E; font-weight: 600; text-align: right; border-bottom: 1px solid #f0ebe6;">${displayName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #7a7067; font-size: 14px; border-bottom: 1px solid #f0ebe6;">Test Type</td>
                    <td style="padding: 12px 0; color: #2C241E; font-weight: 600; text-align: right; border-bottom: 1px solid #f0ebe6;">${safeTestTypeName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #7a7067; font-size: 14px; border-bottom: 1px solid #f0ebe6;">Score</td>
                    <td style="padding: 12px 0; color: #2C241E; font-weight: 600; text-align: right; border-bottom: 1px solid #f0ebe6;">${score}/${totalQuestions}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #7a7067; font-size: 14px; border-bottom: 1px solid #f0ebe6;">Percentage</td>
                    <td style="padding: 12px 0; color: ${percentage >= 70 ? '#22c55e' : '#C06C46'}; font-weight: 700; font-size: 20px; text-align: right; border-bottom: 1px solid #f0ebe6;">${percentage}%</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #7a7067; font-size: 14px;">Status</td>
                    <td style="padding: 12px 0; font-weight: 700; text-align: right; font-size: 16px;">${passStatus}</td>
                  </tr>
                </table>
              </div>
              <p style="color: #4a4a4a; line-height: 1.7; margin: 24px 0 32px; font-size: 15px; text-align: center;">
                Please review this test in the Scoring Dashboard to verify the AI-graded answers and finalize the score.
              </p>
              <div style="text-align: center;">
                <a href="https://cesoirmenulibrary.lovable.app/admin/scoring" style="display: inline-block; background-color: #C06C46; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 4px; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                  Review Test
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
      console.error('Error sending email (non-fatal):', emailError);
      // Don't throw - email failure shouldn't block test completion
      return new Response(
        JSON.stringify({ success: true, notifiedCount: 0, emailWarning: 'Email delivery failed but test recorded' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Notification email sent successfully');

    return new Response(
      JSON.stringify({ success: true, notifiedCount: adminEmails.length }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in notify-test-complete:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
