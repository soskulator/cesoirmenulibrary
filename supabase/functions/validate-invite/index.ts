import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory rate limiting (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(clientIP);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (record.count >= MAX_ATTEMPTS) {
    return false;
  }
  
  record.count++;
  return true;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('cf-connecting-ip') || 
                     'unknown';

    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ valid: false, error: 'Too many attempts. Please try again later.' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { token } = await req.json();

    // Validate token format (should be hex-encoded 32 bytes = 64 chars)
    if (!token || typeof token !== 'string' || !/^[a-f0-9]{64}$/i.test(token)) {
      console.log(`Invalid token format attempt from IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid invitation link.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client with service role for database access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Query the invitation
    const { data, error } = await supabase
      .from('invitations')
      .select('email, role, expires_at, accepted_at')
      .eq('token', token)
      .maybeSingle();

    if (error) {
      console.error('Database error during token validation:', error);
      return new Response(
        JSON.stringify({ valid: false, error: 'Unable to validate invitation. Please try again.' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!data) {
      console.log(`Invalid token attempt from IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ valid: false, error: 'This invitation link is invalid.' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if already accepted
    if (data.accepted_at) {
      return new Response(
        JSON.stringify({ valid: false, error: 'This invitation has already been used.' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if expired
    if (new Date(data.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ valid: false, error: 'This invitation link has expired.' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Valid token verified for email: ${data.email.substring(0, 3)}***`);
    
    return new Response(
      JSON.stringify({ 
        valid: true, 
        email: data.email,
        role: data.role 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in validate-invite:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Unable to validate invitation. Please try again.' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
