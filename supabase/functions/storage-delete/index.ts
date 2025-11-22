import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ErrorResponse {
  code: string;
  message: string;
  details?: any;
  requestId: string;
}

function createError(code: string, message: string, details?: any): ErrorResponse {
  return {
    code,
    message,
    details,
    requestId: crypto.randomUUID(),
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify(createError('UNAUTHORIZED', 'Missing authorization header')),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify(createError('UNAUTHORIZED', 'Invalid or expired token')),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return new Response(
        JSON.stringify(createError('FORBIDDEN', 'Admin access required')),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { id } = await req.json();

    if (!id || typeof id !== 'string') {
      return new Response(
        JSON.stringify(createError('INVALID_INPUT', 'Missing or invalid log id')),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the log entry
    const { data: log, error: logError } = await supabase
      .from('storage_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (logError || !log) {
      return new Response(
        JSON.stringify(createError('NOT_FOUND', 'Storage log not found', logError)),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[storage-delete] Deleting file: ${log.path} from bucket: ${log.bucket}`);

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from(log.bucket)
      .remove([log.path]);

    if (storageError) {
      console.error('[storage-delete] Storage error:', storageError);
      // Continue even if storage deletion fails (file might already be gone)
    }

    // Delete log entry
    const { error: deleteError } = await supabase
      .from('storage_logs')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return new Response(
        JSON.stringify(createError('DELETE_FAILED', 'Failed to delete log entry', deleteError)),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract filename from path
    const filename = log.path.split('/').pop() || log.path;

    console.log(`[storage-delete] Successfully deleted file: ${filename} (${log.size_bytes || 0} bytes)`);

    return new Response(
      JSON.stringify({
        id: log.id,
        deletedBytes: log.size_bytes || 0,
        filename,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[storage-delete] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify(createError('INTERNAL_ERROR', 'An unexpected error occurred', errorMessage)),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
