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

interface CreateRequest {
  email: string;
  full_name?: string;
  role: 'admin' | 'editor' | 'user';
  password?: string;
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
      console.error('[admin-team-create] Role fetch error:', roleError);
      return jsonResponse(
        createError(ErrorCodes.FORBIDDEN, 'Unable to verify user role'),
        403
      );
    }

    const requesterRole = userRoles[0].role;

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
    const { email, full_name, role, password } = body;

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
    // 4. CREATE AUTH USER
    // ========================================
    const { data: newAuthUser, error: authCreateError } = await serviceSupabase.auth.admin.createUser({
      email,
      password: password || undefined, // If no password, Supabase will send magic link
      email_confirm: true, // Auto-confirm email
    });

    if (authCreateError) {
      console.error('[admin-team-create] Auth create error:', authCreateError);
      
      if (authCreateError.message.includes('already registered')) {
        return jsonResponse(
          createError(ErrorCodes.USER_ALREADY_EXISTS, 'A user with this email already exists'),
          409
        );
      }

      return jsonResponse(
        createError(ErrorCodes.INTERNAL_ERROR, 'Failed to create user account', authCreateError.message),
        500
      );
    }

    if (!newAuthUser.user) {
      return jsonResponse(
        createError(ErrorCodes.INTERNAL_ERROR, 'User creation failed'),
        500
      );
    }

    const userId = newAuthUser.user.id;

    // ========================================
    // 5. INSERT INTO user_roles (authoritative)
    // ========================================
    const { error: roleInsertError } = await serviceSupabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: role,
      });

    if (roleInsertError) {
      console.error('[admin-team-create] user_roles insert error:', roleInsertError);
      // Cleanup: delete the auth user we just created
      await serviceSupabase.auth.admin.deleteUser(userId);
      return jsonResponse(
        createError(ErrorCodes.INTERNAL_ERROR, 'Failed to assign role'),
        500
      );
    }

    // ========================================
    // 6. UPDATE profiles (for display sync)
    // ========================================
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

    // ========================================
    // 7. RETURN SUCCESS
    // ========================================
    console.log(`[admin-team-create] User created: ${userId} with role ${role}`);

    return jsonResponse({
      id: userId,
      email: newAuthUser.user.email,
      full_name: full_name || null,
      role: role,
      created_at: newAuthUser.user.created_at,
    }, 201);

  } catch (error) {
    console.error('[admin-team-create] Unexpected error:', error);
    return jsonResponse(
      createError(ErrorCodes.INTERNAL_ERROR, 'An unexpected error occurred'),
      500
    );
  }
});
