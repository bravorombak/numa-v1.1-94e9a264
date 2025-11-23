import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';
import { createError, ErrorCodes } from '../_shared/errors.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { resolveUserRole, type AppRole } from '../_shared/auth.ts';

interface ReactivateRequest {
  user_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse(
        createError(ErrorCodes.UNAUTHORIZED, 'Missing authorization header'),
        401
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userSupabase.auth.getUser();

    if (userError || !user) {
      return jsonResponse(
        createError(ErrorCodes.UNAUTHORIZED, 'Invalid authentication token'),
        401
      );
    }

    // Resolve requester's role using shared helper
    const { requesterRole, allRoles } = await resolveUserRole(user.id, serviceSupabase);

    console.log('[admin-team-reactivate] Role check:', {
      userId: user.id,
      allRoles,
      resolvedRole: requesterRole,
    });

    if (requesterRole === 'user') {
      return jsonResponse(
        createError(
          ErrorCodes.FORBIDDEN,
          'You do not have permission to reactivate team members'
        ),
        403
      );
    }

    // Parse and validate request body
    const body: ReactivateRequest = await req.json();
    const targetUserId = body.user_id;

    if (!targetUserId) {
      return jsonResponse(
        createError(ErrorCodes.INVALID_REQUEST, 'Missing user_id in request body'),
        400
      );
    }

    // Prevent self-reactivation
    if (targetUserId === user.id) {
      return jsonResponse(
        createError(
          ErrorCodes.CANNOT_MODIFY_SELF,
          'You cannot reactivate your own account'
        ),
        403
      );
    }

    // Get target user's role
    const { data: targetRoles, error: targetRoleError } = await serviceSupabase
      .from('user_roles')
      .select('role')
      .eq('user_id', targetUserId);

    if (targetRoleError || !targetRoles || targetRoles.length === 0) {
      return jsonResponse(
        createError(ErrorCodes.USER_NOT_FOUND, 'Target user not found'),
        404
      );
    }

    // Resolve target role with priority logic (admin > editor > user)
    const targetAllRoles = targetRoles.map((r: any) => r.role as AppRole);
    const hasTargetAdmin = targetAllRoles.includes('admin');
    const hasTargetEditor = targetAllRoles.includes('editor');
    const targetRole: AppRole =
      hasTargetAdmin ? 'admin' : hasTargetEditor ? 'editor' : 'user';

    console.log('[admin-team-reactivate] Target role check:', {
      targetUserId,
      allRoles: targetAllRoles,
      resolvedRole: targetRole,
    });

    // Editor restriction: can only reactivate user accounts
    if (requesterRole === 'editor' && targetRole !== 'user') {
      return jsonResponse(
        createError(
          ErrorCodes.FORBIDDEN,
          'Editors can only reactivate user accounts'
        ),
        403
      );
    }

    // Reactivate (unban) the user
    const { error: unbanError } = await serviceSupabase.auth.admin.updateUserById(
      targetUserId,
      { ban_duration: 'none' }
    );

    if (unbanError) {
      console.error('[admin-team-reactivate] Failed to unban user:', unbanError);
      return jsonResponse(
        createError(
          ErrorCodes.INTERNAL_ERROR,
          'Failed to reactivate user',
          unbanError.message
        ),
        500
      );
    }

    console.log('[admin-team-reactivate] User reactivated successfully:', {
      targetUserId,
      requesterRole,
    });

    return jsonResponse({
      message: 'User reactivated successfully',
      user_id: targetUserId,
    });
  } catch (error) {
    console.error('[admin-team-reactivate] Unexpected error:', error);
    return jsonResponse(
      createError(
        ErrorCodes.INTERNAL_ERROR,
        'An unexpected error occurred',
        error instanceof Error ? error.message : String(error)
      ),
      500
    );
  }
});
