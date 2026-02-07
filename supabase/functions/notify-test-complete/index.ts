import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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

    const { 
      attemptId, 
      employeeName, 
      employeeEmail, 
      testType, 
      score, 
      totalQuestions, 
      percentage 
    }: NotifyRequest = await req.json();

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

    const { error: emailError } = await resend.emails.send({
      from: 'Ce Soir Tests <onboarding@resend.dev>',
      to: adminEmails,
      subject: `[Action Required] ${displayName} completed ${testTypeName} Test`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">FoH Test Completed</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              A team member has completed their knowledge test and requires your review.
            </p>
            <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; border: 1px solid #e0e0e0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Employee:</td><td style="padding: 8px 0; color: #333; font-weight: 600; text-align: right;">${displayName}</td></tr>
                <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Test Type:</td><td style="padding: 8px 0; color: #333; font-weight: 600; text-align: right;">${testTypeName}</td></tr>
                <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Score:</td><td style="padding: 8px 0; color: #333; font-weight: 600; text-align: right;">${score}/${totalQuestions}</td></tr>
                <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Percentage:</td><td style="padding: 8px 0; color: ${percentage >= 70 ? '#22c55e' : '#f59e0b'}; font-weight: 600; text-align: right;">${percentage}%</td></tr>
                <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Status:</td><td style="padding: 8px 0; font-weight: 600; text-align: right;">${passStatus}</td></tr>
              </table>
            </div>
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
              Please review this test in the Lead Admin Dashboard to verify the AI-graded answers and finalize the score.
            </p>
            <div style="text-align: center;">
              <p style="font-size: 12px; color: #999; margin-top: 30px;">
                This is an automated notification from Ce Soir Staff Training.
              </p>
            </div>
          </div>
        </div>
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
