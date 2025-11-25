/**
 * admin-team-reset-password
 * Sends a password reset email to a team member
 * 
 * Authorization:
 * - Admin: can reset any member's password
 * - Editor: can only reset user passwords
 * - User: FORBIDDEN
 * - Self-reset: BLOCKED (to prevent accidental lockouts)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';
import { createError, getStatusForErrorCode, ErrorCodes } from '../_shared/errors.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { resolveUserRole, type AppRole } from '../_shared/auth.ts';

interface ResetPasswordRequest {
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

    console.log('[admin-team-reset-password] Requester role check:', {
      userId: user.id,
      allRoles,
      resolvedRole: requesterRole,
    });

    // Only admin and editor can reset passwords
    if (requesterRole === 'user') {
      return jsonResponse(
        createError(ErrorCodes.FORBIDDEN, 'You do not have permission to reset passwords'),
        403
      );
    }

    // ========================================
    // 3. PARSE & VALIDATE REQUEST
    // ========================================
    const body: ResetPasswordRequest = await req.json();
    const { user_id: targetUserId } = body;

    if (!targetUserId) {
      return jsonResponse(
        createError(ErrorCodes.INVALID_REQUEST, 'user_id is required'),
        400
      );
    }

    // ========================================
    // 4. SELF-PROTECTION: Prevent self-reset
    // ========================================
    if (targetUserId === user.id) {
      return jsonResponse(
        createError(ErrorCodes.FORBIDDEN, 'You cannot reset your own password from this interface'),
        403
      );
    }

    // ========================================
    // 5. RESOLVE TARGET USER'S ROLE
    // ========================================
    const { requesterRole: targetRole, allRoles: targetRoles } = await resolveUserRole(
      targetUserId,
      serviceSupabase
    );

    console.log('[admin-team-reset-password] Target role check:', {
      targetUserId,
      targetRoles,
      targetRole,
    });

    // ========================================
    // 6. AUTHORIZATION CHECKS
    // ========================================
    // Editors can only reset user passwords
    if (requesterRole === 'editor' && targetRole !== 'user') {
      return jsonResponse(
        createError(ErrorCodes.FORBIDDEN, 'Editors can only reset passwords for user accounts'),
        403
      );
    }

    // ========================================
    // 7. GET TARGET USER'S EMAIL
    // ========================================
    const { data: targetAuthUser, error: getUserError } = await serviceSupabase.auth.admin.getUserById(
      targetUserId
    );

    if (getUserError || !targetAuthUser.user) {
      console.error('[admin-team-reset-password] Failed to get target user:', getUserError);
      return jsonResponse(
        createError(ErrorCodes.INVALID_REQUEST, 'Target user not found'),
        404
      );
    }

    const targetEmail = targetAuthUser.user.email;
    if (!targetEmail) {
      return jsonResponse(
        createError(ErrorCodes.INVALID_REQUEST, 'Target user has no email address'),
        400
      );
    }

    // ========================================
    // 8. SEND PASSWORD RESET EMAIL
    // ========================================
    const { data: resetLink, error: resetError } = await serviceSupabase.auth.admin.generateLink({
      type: 'recovery',
      email: targetEmail,
    });

    if (resetError) {
      console.error('[admin-team-reset-password] Failed to generate reset link:', resetError);
      return jsonResponse(
        createError(ErrorCodes.INTERNAL_ERROR, 'Failed to send password reset email', resetError.message),
        500
      );
    }

    // ========================================
    // 9. RETURN SUCCESS
    // ========================================
    console.log(`[admin-team-reset-password] Password reset sent to: ${targetEmail}`);

    return jsonResponse({
      message: 'Password reset email sent',
      user_id: targetUserId,
      email: targetEmail,
    });

  } catch (error) {
    console.error('[admin-team-reset-password] Unexpected error:', error);
    return jsonResponse(
      createError(ErrorCodes.INTERNAL_ERROR, 'An unexpected error occurred'),
      500
    );
  }
});
