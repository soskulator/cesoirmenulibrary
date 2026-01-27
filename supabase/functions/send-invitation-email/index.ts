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
        from: "Ce Soir <noreply@cesoirnaples.com>",
        to: [email],
        subject: "You're Invited to Join Ce Soir Staff Portal",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Georgia', serif; background-color: #1a1a1a; margin: 0; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #262626; border-radius: 8px; overflow: hidden; border: 1px solid #c9a962;">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #c9a962 0%, #b8935c 100%); padding: 30px; text-align: center;">
                <h1 style="color: #1a1a1a; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 2px;">CE SOIR</h1>
                <p style="color: #2d2d2d; margin: 8px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Staff Training Portal</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px;">
                <h2 style="color: #c9a962; margin: 0 0 20px; font-size: 22px; font-weight: 500;">You've Been Invited!</h2>
                
                <p style="color: #e0e0e0; line-height: 1.6; margin: 0 0 20px; font-size: 16px;">
                  You have been invited${inviterText} to join the Ce Soir staff training portal as <strong style="color: #c9a962;">${roleName}</strong>.
                </p>
                
                <p style="color: #e0e0e0; line-height: 1.6; margin: 0 0 30px; font-size: 16px;">
                  Click the button below to create your account and get started with your training materials, quizzes, and more.
                </p>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${inviteLink}" style="display: inline-block; background: linear-gradient(135deg, #c9a962 0%, #b8935c 100%); color: #1a1a1a; text-decoration: none; padding: 16px 40px; border-radius: 4px; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                    Create Your Account
                  </a>
                </div>
                
                <p style="color: #888; font-size: 13px; line-height: 1.5; margin: 30px 0 0;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <a href="${inviteLink}" style="color: #c9a962; word-break: break-all;">${inviteLink}</a>
                </p>
                
                <p style="color: #888; font-size: 13px; line-height: 1.5; margin: 20px 0 0;">
                  This invitation link will expire in 7 days.
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #1a1a1a; padding: 20px 30px; text-align: center; border-top: 1px solid #333;">
                <p style="color: #666; font-size: 12px; margin: 0;">
                  © 2026 Ce Soir Naples. All rights reserved.
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
