/**
 * admin-team-update
 * Updates a team member's profile and/or role
 * 
 * Authorization:
 * - Admin: can update all users except cannot demote sole admin
 * - Editor: can only update user accounts (not admin/editor)
 * - User: FORBIDDEN
 * 
 * Rules:
 * - No one can modify their own role
 * - Cannot demote the sole admin
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';
import { createError, getStatusForErrorCode, ErrorCodes } from '../_shared/errors.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

interface UpdateRequest {
  user_id: string;
  updates: {
    full_name?: string;
    role?: 'admin' | 'editor' | 'user';
    avatar_url?: string;
  };
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
    const { data: userRoles, error: roleError } = await serviceSupabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (roleError || !userRoles || userRoles.length === 0) {
      console.error('[admin-team-update] Role fetch error:', roleError);
      return jsonResponse(
        createError(ErrorCodes.FORBIDDEN, 'Unable to verify user role'),
        403
      );
    }

    const requesterRole = userRoles[0].role;

    // Only admin and editor can update users
    if (requesterRole === 'user') {
      return jsonResponse(
        createError(ErrorCodes.FORBIDDEN, 'You do not have permission to update team members'),
        403
      );
    }

    // ========================================
    // 3. PARSE & VALIDATE REQUEST
    // ========================================
    const body: UpdateRequest = await req.json();
    const { user_id: targetUserId, updates } = body;

    if (!targetUserId) {
      return jsonResponse(
        createError(ErrorCodes.INVALID_REQUEST, 'user_id is required'),
        400
      );
    }

    if (!updates || Object.keys(updates).length === 0) {
      return jsonResponse(
        createError(ErrorCodes.INVALID_REQUEST, 'No updates provided'),
        400
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

    // Cannot modify self
    if (targetUserId === user.id) {
      return jsonResponse(
        createError(ErrorCodes.CANNOT_MODIFY_SELF, 'You cannot modify your own account'),
        403
      );
    }

    // Editors can only modify user accounts
    if (requesterRole === 'editor' && targetRole !== 'user') {
      return jsonResponse(
        createError(ErrorCodes.FORBIDDEN, 'Editors can only modify user accounts'),
        403
      );
    }

    // Editors cannot promote users to admin/editor
    if (requesterRole === 'editor' && updates.role && updates.role !== 'user') {
      return jsonResponse(
        createError(ErrorCodes.FORBIDDEN, 'Editors cannot assign admin or editor roles'),
        403
      );
    }

    // Check sole admin protection (if changing role from admin)
    if (targetRole === 'admin' && updates.role && updates.role !== 'admin') {
      // Count total admins
      const { count: adminCount } = await serviceSupabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      if (adminCount === 1) {
        return jsonResponse(
          createError(
            ErrorCodes.CANNOT_DELETE_SOLE_ADMIN,
            'Cannot demote the sole admin. Promote another user to admin first.'
          ),
          403
        );
      }
    }

    // ========================================
    // 6. UPDATE PROFILE
    // ========================================
    const profileUpdates: any = {};
    if (updates.full_name !== undefined) profileUpdates.full_name = updates.full_name;
    if (updates.avatar_url !== undefined) profileUpdates.avatar_url = updates.avatar_url;
    if (updates.role !== undefined) profileUpdates.role = updates.role; // Sync for display

    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await serviceSupabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', targetUserId);

      if (profileError) {
        console.error('[admin-team-update] Profile update error:', profileError);
        // Not critical, continue
      }
    }

    // ========================================
    // 7. UPDATE ROLE (if changed)
    // ========================================
    if (updates.role && updates.role !== targetRole) {
      const { error: roleUpdateError } = await serviceSupabase
        .from('user_roles')
        .update({ role: updates.role })
        .eq('user_id', targetUserId);

      if (roleUpdateError) {
        console.error('[admin-team-update] user_roles update error:', roleUpdateError);
        return jsonResponse(
          createError(ErrorCodes.INTERNAL_ERROR, 'Failed to update role'),
          500
        );
      }
    }

    // ========================================
    // 8. FETCH UPDATED USER
    // ========================================
    const { data: updatedProfile } = await serviceSupabase
      .from('profiles')
      .select('id, full_name, avatar_url, role')
      .eq('id', targetUserId)
      .single();

    const { data: updatedRole } = await serviceSupabase
      .from('user_roles')
      .select('role')
      .eq('user_id', targetUserId)
      .single();

    console.log(`[admin-team-update] User updated: ${targetUserId}`);

    return jsonResponse({
      id: targetUserId,
      full_name: updatedProfile?.full_name || null,
      avatar_url: updatedProfile?.avatar_url || null,
      role: updatedRole?.role || targetRole,
    });

  } catch (error) {
    console.error('[admin-team-update] Unexpected error:', error);
    return jsonResponse(
      createError(ErrorCodes.INTERNAL_ERROR, 'An unexpected error occurred'),
      500
    );
  }
});
