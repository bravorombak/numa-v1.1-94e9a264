/**
 * admin-team-list
 * Lists all team members with optional filtering
 * 
 * Authorization: Admin and Editor can see all accounts
 * User role: FORBIDDEN
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';
import { createError, getStatusForErrorCode, ErrorCodes } from '../_shared/errors.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

interface ListRequest {
  role?: 'admin' | 'editor' | 'user';
  search?: string;
  page?: number;
  limit?: number;
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
      console.error('[admin-team-list] Role fetch error:', roleError);
      return jsonResponse(
        createError(ErrorCodes.FORBIDDEN, 'Unable to verify user role'),
        403
      );
    }

    // Determine highest role (priority: admin > editor > user)
    const hasAdmin = userRoles.some(r => r.role === 'admin');
    const hasEditor = userRoles.some(r => r.role === 'editor');

    const requesterRole = hasAdmin
      ? 'admin'
      : hasEditor
      ? 'editor'
      : 'user';

    console.log('[admin-team-list] Role check:', {
      userId: user.id,
      allRoles: userRoles.map(r => r.role),
      resolvedRole: requesterRole,
    });

    // Only admin and editor can access team list
    if (requesterRole === 'user') {
      return jsonResponse(
        createError(ErrorCodes.FORBIDDEN, 'You do not have permission to view team members'),
        403
      );
    }

    // ========================================
    // 3. PARSE REQUEST
    // ========================================
    const body: ListRequest = req.method === 'POST' ? await req.json() : {};
    const { role: roleFilter, search, page = 1, limit = 50 } = body;

    // ========================================
    // 4. BUILD QUERY
    // ========================================
    let query = serviceSupabase
      .from('user_roles')
      .select(`
        user_id,
        role,
        created_at
      `, { count: 'exact' });

    // Apply role filter if provided
    if (roleFilter) {
      query = query.eq('role', roleFilter);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    const { data: userRolesData, error: queryError, count } = await query;

    if (queryError) {
      console.error('[admin-team-list] Query error:', queryError);
      return jsonResponse(
        createError(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch team members'),
        500
      );
    }

    if (!userRolesData || userRolesData.length === 0) {
      return jsonResponse({
        users: [],
        total: 0,
        page,
        limit,
      });
    }

    // ========================================
    // 5. FETCH USER DETAILS FROM AUTH & PROFILES
    // ========================================
    const userIds = userRolesData.map((ur) => ur.user_id);

    // Fetch auth users (email, created_at, last_sign_in_at, banned)
    const { data: authUsers } = await serviceSupabase.auth.admin.listUsers();
    const authUsersMap = new Map(
      authUsers?.users
        ?.filter((u) => userIds.includes(u.id))
        .map((u) => [u.id, u]) || []
    );

    // Fetch profiles (full_name, avatar_url, deleted_at)
    const { data: profiles } = await serviceSupabase
      .from('profiles')
      .select('id, full_name, avatar_url, created_at, updated_at')
      .in('id', userIds);

    const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    // ========================================
    // 6. BUILD RESPONSE
    // ========================================
    const users = userRolesData.map((ur) => {
      const authUser = authUsersMap.get(ur.user_id);
      const profile = profilesMap.get(ur.user_id);

      // Apply search filter if provided
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesEmail = authUser?.email?.toLowerCase().includes(searchLower);
        const matchesName = profile?.full_name?.toLowerCase().includes(searchLower);
        if (!matchesEmail && !matchesName) {
          return null;
        }
      }

      return {
        id: ur.user_id,
        email: authUser?.email || null,
        full_name: profile?.full_name || null,
        avatar_url: profile?.avatar_url || null,
        role: ur.role,
        created_at: authUser?.created_at || ur.created_at,
        last_sign_in_at: authUser?.last_sign_in_at || null,
        banned: (authUser as any)?.banned || false,
      };
    }).filter(Boolean); // Remove nulls from search filter

    return jsonResponse({
      users,
      total: count || 0,
      page,
      limit,
    });

  } catch (error) {
    console.error('[admin-team-list] Unexpected error:', error);
    return jsonResponse(
      createError(ErrorCodes.INTERNAL_ERROR, 'An unexpected error occurred'),
      500
    );
  }
});
