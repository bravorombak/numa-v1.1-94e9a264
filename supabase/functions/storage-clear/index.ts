import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ErrorResponse {
  code: string;
  message: string;
  details: any;
  requestId: string;
}

function createError(code: string, message: string, details?: any): ErrorResponse {
  return {
    code,
    message,
    details: details || null,
    requestId: crypto.randomUUID(),
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      const error = createError('UNAUTHORIZED', 'Missing authorization header');
      return new Response(JSON.stringify(error), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      const error = createError('UNAUTHORIZED', 'Invalid token');
      return new Response(JSON.stringify(error), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin via profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      const error = createError('FORBIDDEN', 'Admin access required');
      return new Response(JSON.stringify(error), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { range } = await req.json();
    
    const validRanges = ['today', '1-week', '1-month', '3-month', '7-month', '1-year'];
    if (!validRanges.includes(range)) {
      const error = createError('INVALID_RANGE', 'Invalid range parameter', { validRanges });
      return new Response(JSON.stringify(error), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate cutoff date - delete files OLDER than this date
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (range) {
      case 'today':
        cutoffDate.setHours(0, 0, 0, 0);
        break;
      case '1-week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '1-month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3-month':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '7-month':
        cutoffDate.setMonth(now.getMonth() - 7);
        break;
      case '1-year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    console.log(`[storage-clear] Range: ${range}, Cutoff: ${cutoffDate.toISOString()}`);

    // Get files to delete from storage_logs (older than cutoff, not already deleted)
    const { data: logsToDelete, error: logsError } = await supabase
      .from('storage_logs')
      .select('id, bucket, path, size_bytes')
      .lte('created_at', cutoffDate.toISOString())
      .is('deleted_at', null);

    if (logsError) {
      console.error('[storage-clear] Error fetching logs:', logsError);
      throw logsError;
    }

    let deletedCount = 0;
    let deletedBytes = 0;

    if (logsToDelete && logsToDelete.length > 0) {
      console.log(`[storage-clear] Found ${logsToDelete.length} files to delete`);

      // Delete files from storage
      const pathsToDelete = logsToDelete.map(log => log.path);
      
      const { error: storageError } = await supabase.storage
        .from('numa-files')
        .remove(pathsToDelete);

      if (storageError) {
        console.error('[storage-clear] Storage deletion error:', storageError);
        // Continue anyway to clean up logs
      }

      // Delete storage_logs rows (hard delete)
      const idsToDelete = logsToDelete.map(log => log.id);
      const { error: deleteError } = await supabase
        .from('storage_logs')
        .delete()
        .in('id', idsToDelete);

      if (deleteError) {
        console.error('[storage-clear] Error deleting logs:', deleteError);
        throw deleteError;
      }

      deletedCount = logsToDelete.length;
      deletedBytes = logsToDelete.reduce((sum, log) => sum + (log.size_bytes || 0), 0);
    }

    console.log(`[storage-clear] Deleted ${deletedCount} files (${deletedBytes} bytes)`);

    return new Response(
      JSON.stringify({
        deletedCount,
        deletedBytes,
        range,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[storage-clear] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const errorResponse = createError('INTERNAL_ERROR', errorMessage);
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
