/**
 * admin-team-create
 * Creates a new team member
 * 
 * Authorization:
 * - Admin: can create admin | editor | user
 * - Editor: can only create user
 * - User: FORBIDDEN
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';
import { createError, getStatusForErrorCode, ErrorCodes } from '../_shared/errors.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { resolveUserRole } from '../_shared/auth.ts';

interface CreateRequest {
  email: string;
  full_name?: string;
  role: 'admin' | 'editor' | 'user';
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

    console.log('[admin-team-create] Role check:', {
      userId: user.id,
      allRoles,
      resolvedRole: requesterRole,
    });

    // Only admin and editor can create users
    if (requesterRole === 'user') {
      return jsonResponse(
        createError(ErrorCodes.FORBIDDEN, 'You do not have permission to create team members'),
        403
      );
    }

    // ========================================
    // 3. PARSE & VALIDATE REQUEST
    // ========================================
    const body: CreateRequest = await req.json();
    const { email, full_name, role } = body;

    if (!email || !email.includes('@')) {
      return jsonResponse(
        createError(ErrorCodes.INVALID_REQUEST, 'Valid email is required'),
        400
      );
    }

    if (!role || !['admin', 'editor', 'user'].includes(role)) {
      return jsonResponse(
        createError(ErrorCodes.INVALID_REQUEST, 'Valid role is required (admin, editor, or user)'),
        400
      );
    }

    // Editors can only create users
    if (requesterRole === 'editor' && role !== 'user') {
      return jsonResponse(
        createError(ErrorCodes.FORBIDDEN, 'Editors can only create user accounts'),
        403
      );
    }

    // ========================================
    // 4. INVITE USER OR HANDLE EXISTING
    // ========================================
    const { data: invitedUser, error: inviteError } = await serviceSupabase.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          full_name: full_name || null,
        },
      }
    );

    let newUserId: string;
    let isExistingUser = false;

    // Handle existing email case
    if (inviteError) {
      const errorMessage = inviteError.message?.toLowerCase() || '';
      
      if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
        console.log('[admin-team-create] Email exists, adding role to existing user:', email);
        
        // Fetch existing user by email
        const { data: existingUsers } = await serviceSupabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find((u) => u.email === email);

        if (!existingUser) {
          console.error('[admin-team-create] User exists but could not be found:', email);
          return jsonResponse(
            createError(ErrorCodes.INTERNAL_ERROR, 'User exists but could not be retrieved'),
            500
          );
        }

        newUserId = existingUser.id;
        isExistingUser = true;
        console.log('[admin-team-create] Found existing user:', { userId: newUserId, email });
      } else {
        console.error('[admin-team-create] Invite error:', inviteError);
        return jsonResponse(
          createError(
            ErrorCodes.INTERNAL_ERROR,
            'Failed to send invitation email',
            inviteError?.message
          ),
          500
        );
      }
    } else if (!invitedUser.user) {
      console.error('[admin-team-create] No user returned from invite');
      return jsonResponse(
        createError(ErrorCodes.INTERNAL_ERROR, 'Failed to create user'),
        500
      );
    } else {
      newUserId = invitedUser.user.id;
      console.log('[admin-team-create] User invited:', { userId: newUserId, email, role });
    }

    const userId = newUserId;

    // ========================================
    // 5. INSERT INTO user_roles (authoritative)
    // ========================================
    // Note: The handle_new_user trigger automatically creates a 'user' role.
    // We use upsert to handle this gracefully.
    const { error: roleInsertError } = await serviceSupabase
      .from('user_roles')
      .upsert(
        {
          user_id: userId,
          role: role,
        },
        {
          onConflict: 'user_id,role',
          ignoreDuplicates: true,
        }
      );

    if (roleInsertError) {
      console.error('[admin-team-create] user_roles upsert error:', roleInsertError);
      // Cleanup: delete the auth user we just created
      await serviceSupabase.auth.admin.deleteUser(userId);
      return jsonResponse(
        createError(
          ErrorCodes.INTERNAL_ERROR,
          'Failed to assign role',
          roleInsertError.message
        ),
        500
      );
    }

    // ========================================
    // 6. UPDATE profiles (for display sync)
    // ========================================
    if (!isExistingUser) {
      const { error: profileUpdateError } = await serviceSupabase
        .from('profiles')
        .update({
          full_name: full_name || null,
          role: role, // Sync for display only
        })
        .eq('id', userId);

      if (profileUpdateError) {
        console.error('[admin-team-create] profiles update error:', profileUpdateError);
        // Not critical, continue
      }
    }

    // ========================================
    // 7. FETCH ALL ROLES FOR RESPONSE
    // ========================================
    const { data: allUserRoles } = await serviceSupabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    const roles = allUserRoles?.map((r) => r.role) || [role];
    const hasAdmin = roles.includes('admin');
    const hasEditor = roles.includes('editor');
    const resolved_role = hasAdmin ? 'admin' : hasEditor ? 'editor' : 'user';

    // ========================================
    // 8. SUCCESS RESPONSE
    // ========================================
    console.log(`[admin-team-create] User ${isExistingUser ? 'updated' : 'invited'}: ${userId} with role ${role}`);

    return jsonResponse({
      id: userId,
      email,
      full_name: full_name || null,
      role,
      roles,
      resolved_role,
      invitation_sent: !isExistingUser,
      role_added: isExistingUser,
    }, 201);

  } catch (error) {
    console.error('[admin-team-create] Unexpected error:', error);
    return jsonResponse(
      createError(ErrorCodes.INTERNAL_ERROR, 'An unexpected error occurred'),
      500
    );
  }
});
