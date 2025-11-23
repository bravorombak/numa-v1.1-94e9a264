/**
 * admin-team-deactivate
 * Soft-deactivates a team member by banning their account
 * 
 * Authorization:
 * - Admin: can deactivate all users except sole admin
 * - Editor: can only deactivate user accounts (not admin/editor)
 * - User: FORBIDDEN
 * 
 * Rules:
 * - Cannot deactivate self
 * - Cannot deactivate the sole admin
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';
import { createError, getStatusForErrorCode, ErrorCodes } from '../_shared/errors.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { resolveUserRole } from '../_shared/auth.ts';

interface DeactivateRequest {
  user_id: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ========================================
    // 1. AUTHENTICATION
    // ========================================
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse(
        createError(ErrorCodes.UNAUTHORIZED, 'Missing authorization header'),
        401
      );
    }

    // Service role client for admin operations
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // User client to verify auth
    const userSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await userSupabase.auth.getUser();
    if (authError || !user) {
      return jsonResponse(
        createError(ErrorCodes.UNAUTHORIZED, 'Invalid or expired token'),
        401
      );
    }

    // ========================================
    // 2. CHECK REQUESTER ROLE (use user_roles)
    // ========================================
    const { requesterRole, allRoles } = await resolveUserRole(user.id, serviceSupabase);

    console.log('[admin-team-deactivate] Role check:', {
      userId: user.id,
      allRoles,
      resolvedRole: requesterRole,
    });

    // Only admin and editor can deactivate users
    if (requesterRole === 'user') {
      return jsonResponse(
        createError(ErrorCodes.FORBIDDEN, 'You do not have permission to deactivate team members'),
        403
      );
    }

    // ========================================
    // 3. PARSE & VALIDATE REQUEST
    // ========================================
    const body: DeactivateRequest = await req.json();
    const { user_id: targetUserId } = body;

    if (!targetUserId) {
      return jsonResponse(
        createError(ErrorCodes.INVALID_REQUEST, 'user_id is required'),
        400
      );
    }

    // Cannot deactivate self
    if (targetUserId === user.id) {
      return jsonResponse(
        createError(ErrorCodes.CANNOT_MODIFY_SELF, 'You cannot deactivate your own account'),
        403
      );
    }

    // ========================================
    // 4. FETCH TARGET USER'S CURRENT ROLE
    // ========================================
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

    const targetRole = targetRoles[0].role;

    // ========================================
    // 5. ENFORCE PERMISSION RULES
    // ========================================

    // Editors can only deactivate user accounts
    if (requesterRole === 'editor' && targetRole !== 'user') {
      return jsonResponse(
        createError(ErrorCodes.FORBIDDEN, 'Editors can only deactivate user accounts'),
        403
      );
    }

    // Check sole admin protection
    if (targetRole === 'admin') {
      const { count: adminCount } = await serviceSupabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      if (adminCount === 1) {
        return jsonResponse(
          createError(
            ErrorCodes.CANNOT_DELETE_SOLE_ADMIN,
            'Cannot deactivate the sole admin. Promote another user to admin first.'
          ),
          403
        );
      }
    }

    // ========================================
    // 6. SOFT DEACTIVATE (BAN USER)
    // ========================================
    const { error: banError } = await serviceSupabase.auth.admin.updateUserById(
      targetUserId,
      { ban_duration: '876600h' } // ~100 years = effective permanent ban; reversible with 'none'
    );

    if (banError) {
      console.error('[admin-team-deactivate] Ban error:', banError);
      return jsonResponse(
        createError(ErrorCodes.INTERNAL_ERROR, 'Failed to deactivate user', banError.message),
        500
      );
    }

    // ========================================
    // 7. OPTIONALLY MARK IN PROFILES (for UI display)
    // ========================================
    // Note: Supabase auth.users table doesn't have a deleted_at column we can set directly,
    // but we track ban status through the admin API. If you want an additional soft-delete marker:
    // await serviceSupabase.from('profiles').update({ deleted_at: new Date().toISOString() }).eq('id', targetUserId);

    console.log(`[admin-team-deactivate] User deactivated: ${targetUserId}`);

    return jsonResponse({
      message: 'User deactivated successfully',
      user_id: targetUserId,
    });

  } catch (error) {
    console.error('[admin-team-deactivate] Unexpected error:', error);
    return jsonResponse(
      createError(ErrorCodes.INTERNAL_ERROR, 'An unexpected error occurred'),
      500
    );
  }
});
