import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AddMessageRequest {
  session_id: string;
  content: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization')!;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[sessions-add-message] Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[sessions-add-message] Authenticated user:', user.id);

    // Parse request body
    const body: AddMessageRequest = await req.json();
    const { session_id, content } = body;

    if (!session_id || !content) {
      console.error('[sessions-add-message] Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing session_id or content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate session ownership
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, user_id')
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      console.error('[sessions-add-message] Session not found:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (session.user_id !== user.id) {
      console.error('[sessions-add-message] User does not own session');
      return new Response(
        JSON.stringify({ error: 'Forbidden: You do not own this session' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert message into messages table
    const { data: message, error: insertError } = await supabase
      .from('messages')
      .insert({
        session_id: session_id,
        role: 'user',
        content: content,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[sessions-add-message] Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to insert message', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[sessions-add-message] Message created:', message.id);

    // Return created message
    return new Response(
      JSON.stringify(message),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[sessions-add-message] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
