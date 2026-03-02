import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const userId = claimsData.claims.sub;

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

    const passingScore = 70;
    const passed = percentage >= passingScore;
    const passStatus = passed ? 'PASSED ✅' : 'DID NOT PASS ⚠️';
    const passColor = passed ? '#22c55e' : '#ef4444';
    const displayName = (employeeName && employeeName !== 'Unknown') ? employeeName : 'Team Member';

    console.log(`Sending test results to ${employeeEmail} for attempt ${attemptId}`);

    const { error: emailError } = await resend.emails.send({
      from: 'Ce Soir Tests <onboarding@resend.dev>',
      to: [employeeEmail],
      subject: `Your ${testName} Results — ${passStatus}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Your Test Results</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Hi ${displayName}, your manager has reviewed your test. Here are your results:
            </p>
            <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 20px; border: 1px solid #e0e0e0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #666; font-size: 14px;">Test:</td>
                  <td style="padding: 10px 0; color: #333; font-weight: 600; text-align: right;">${testName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666; font-size: 14px;">Score:</td>
                  <td style="padding: 10px 0; color: #333; font-weight: 600; text-align: right;">${score} / ${totalQuestions}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666; font-size: 14px;">Percentage:</td>
                  <td style="padding: 10px 0; color: ${passColor}; font-weight: 700; font-size: 18px; text-align: right;">${percentage}%</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666; font-size: 14px;">Result:</td>
                  <td style="padding: 10px 0; color: ${passColor}; font-weight: 700; text-align: right;">${passStatus}</td>
                </tr>
              </table>
            </div>
            <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
              ${passed 
                ? 'Congratulations on passing your test! Keep up the great work.' 
                : 'Please review the study materials and speak with your manager about next steps.'}
            </p>
            <div style="text-align: center; margin-top: 30px;">
              <p style="font-size: 12px; color: #999;">
                This is an automated message from Ce Soir Staff Training.
              </p>
            </div>
          </div>
        </div>
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
