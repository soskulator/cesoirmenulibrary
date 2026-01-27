import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
console.log("RESEND_API_KEY loaded, length:", RESEND_API_KEY.length);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailRequest {
  email: string;
  inviteLink: string;
  role: string;
  invitedByName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, inviteLink, role, invitedByName }: InvitationEmailRequest = await req.json();

    // Validate required fields
    if (!email || !inviteLink) {
      throw new Error("Missing required fields: email and inviteLink");
    }

    const roleName = role === 'lead_admin' ? 'Lead Admin' : role === 'admin' ? 'Admin' : 'Employee';
    const inviterText = invitedByName ? ` by ${invitedByName}` : '';

    console.log(`Sending invitation email to ${email} for role ${role}`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Ce Soir <onboarding@resend.dev>",
        to: [email],
        subject: "You're Invited to Join Ce Soir Staff Portal",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Georgia', serif; background-color: #2C241E; margin: 0; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #F9F7F5; border-radius: 8px; overflow: hidden;">
              
              <!-- Header with Logo -->
              <div style="background-color: #2C241E; padding: 40px 30px; text-align: center;">
                <img src="https://cchhvuotfdxswpxwnxgv.supabase.co/storage/v1/object/public/email-assets/cesoir-logo.png?v=1" alt="Ce Soir" width="180" style="display: block; margin: 0 auto;" />
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px;">
                <h2 style="color: #2C241E; margin: 0 0 24px; font-size: 26px; font-weight: 500; font-family: 'Playfair Display', Georgia, serif; text-align: center;">You're Invited to Join Our Team</h2>
                
                <p style="color: #4a4a4a; line-height: 1.7; margin: 0 0 20px; font-size: 16px; text-align: center;">
                  You have been invited${inviterText} to join the <strong style="color: #C06C46;">Ce Soir</strong> staff training portal as <strong style="color: #C06C46;">${roleName}</strong>.
                </p>
                
                <p style="color: #4a4a4a; line-height: 1.7; margin: 0 0 32px; font-size: 16px; text-align: center;">
                  Access our comprehensive menu library, training materials, and quizzes to master the Ce Soir dining experience.
                </p>
                
                <!-- CTA Button -->
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
              
              <!-- Footer -->
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

    console.log("Invitation email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, ...emailData }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invitation-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
