import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Create regular client to verify the caller is authenticated
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify the caller is authenticated
    const { data: { user: caller }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !caller) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if caller is a lead_admin
    const { data: callerRole, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .single();

    if (roleError || callerRole?.role !== 'lead_admin') {
      console.error('Role check failed:', roleError, 'Role:', callerRole?.role);
      return new Response(
        JSON.stringify({ error: 'Only lead admins can delete users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the user ID to delete
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prevent self-deletion
    if (userId === caller.id) {
      return new Response(
        JSON.stringify({ error: 'Cannot delete your own account' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Lead admin ${caller.id} is deleting user ${userId}`);

    // Delete all related data first
    // 1. Delete quiz scores
    const { error: quizError } = await supabaseAdmin
      .from('quiz_scores')
      .delete()
      .eq('user_id', userId);
    if (quizError) console.error('Error deleting quiz_scores:', quizError);

    // 2. Delete study progress
    const { error: progressError } = await supabaseAdmin
      .from('study_progress')
      .delete()
      .eq('user_id', userId);
    if (progressError) console.error('Error deleting study_progress:', progressError);

    // 3. Delete staff activity log
    const { error: activityError } = await supabaseAdmin
      .from('staff_activity_log')
      .delete()
      .eq('user_id', userId);
    if (activityError) console.error('Error deleting staff_activity_log:', activityError);

    // 4. Delete FOH test attempts and answers
    const { data: attempts } = await supabaseAdmin
      .from('foh_test_attempts')
      .select('id')
      .eq('user_id', userId);
    
    if (attempts && attempts.length > 0) {
      const attemptIds = attempts.map(a => a.id);
      const { error: answersError } = await supabaseAdmin
        .from('foh_test_answers')
        .delete()
        .in('attempt_id', attemptIds);
      if (answersError) console.error('Error deleting foh_test_answers:', answersError);
      
      const { error: attemptsError } = await supabaseAdmin
        .from('foh_test_attempts')
        .delete()
        .eq('user_id', userId);
      if (attemptsError) console.error('Error deleting foh_test_attempts:', attemptsError);
    }

    // 5. Delete user roles
    const { error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
    if (rolesError) console.error('Error deleting user_roles:', rolesError);

    // 6. Delete profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);
    if (profileError) console.error('Error deleting profile:', profileError);

    // 7. Finally, delete the auth user
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (deleteUserError) {
      console.error('Error deleting auth user:', deleteUserError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete user account', details: deleteUserError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully deleted user ${userId}`);

    return new Response(
      JSON.stringify({ success: true, message: 'User completely removed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
