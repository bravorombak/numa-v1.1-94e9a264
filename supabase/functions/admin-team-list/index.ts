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
import { resolveUserRole, type AppRole } from '../_shared/auth.ts';

interface ListRequest {
  role?: 'admin' | 'editor' | 'user';
  search?: string;
  page?: number;
  limit?: number;
  status?: 'active' | 'deactivated';
}

interface MergedUser {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  roles: string[];
  resolved_role: AppRole;
  banned: boolean;
  created_at: string | null;
  last_sign_in_at: string | null;
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

    console.log('[admin-team-list] Role check:', {
      userId: user.id,
      allRoles,
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
    const { role: roleFilter, search, page = 1, limit = 50, status: statusFilter } = body;

    // ========================================
    // 4. FETCH ALL USER_ROLES (NO PAGINATION YET)
    // ========================================
    let query = serviceSupabase
      .from('user_roles')
      .select('user_id, role, created_at');

    const { data: userRolesData, error: queryError } = await query;

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
    const allUserIds = [...new Set(userRolesData.map((ur) => ur.user_id))];

    // Fetch auth users (email, created_at, last_sign_in_at, banned)
    const { data: authUsers } = await serviceSupabase.auth.admin.listUsers();
    const authUsersMap = new Map(
      authUsers?.users
        ?.filter((u) => allUserIds.includes(u.id))
        .map((u) => [u.id, u]) || []
    );

    // Fetch profiles (full_name, avatar_url)
    const { data: profiles } = await serviceSupabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', allUserIds);

    const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    // ========================================
    // 6. MERGE ROLES BY USER_ID
    // ========================================
    const userMap = new Map<string, MergedUser>();

    for (const ur of userRolesData) {
      const userId = ur.user_id;
      const authUser = authUsersMap.get(userId);
      const profile = profilesMap.get(userId);

      if (!userMap.has(userId)) {
        userMap.set(userId, {
          id: userId,
          email: authUser?.email || null,
          full_name: profile?.full_name || null,
          avatar_url: profile?.avatar_url || null,
          roles: [],
          resolved_role: 'user',
          banned: (authUser as any)?.banned || false,
          created_at: authUser?.created_at || ur.created_at,
          last_sign_in_at: authUser?.last_sign_in_at || null,
        });
      }

      const user = userMap.get(userId)!;
      user.roles.push(ur.role);
    }

    // Resolve highest priority role for each user
    for (const user of userMap.values()) {
      const hasAdmin = user.roles.includes('admin');
      const hasEditor = user.roles.includes('editor');
      user.resolved_role = hasAdmin ? 'admin' : hasEditor ? 'editor' : 'user';
    }

    // ========================================
    // 7. APPLY FILTERS ON MERGED USERS
    // ========================================
    let filteredUsers = Array.from(userMap.values());

    // Role filter: check if user has the requested role
    if (roleFilter) {
      filteredUsers = filteredUsers.filter((user) => user.roles.includes(roleFilter));
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter((user) => {
        const matchesEmail = user.email?.toLowerCase().includes(searchLower);
        const matchesName = user.full_name?.toLowerCase().includes(searchLower);
        return matchesEmail || matchesName;
      });
    }

    // Status filter
    if (statusFilter) {
      filteredUsers = filteredUsers.filter((user) => {
        if (statusFilter === 'active') return !user.banned;
        if (statusFilter === 'deactivated') return user.banned;
        return true;
      });
    }

    // Sort by created_at desc
    filteredUsers.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });

    // ========================================
    // 8. APPLY PAGINATION
    // ========================================
    const total = filteredUsers.length;
    const offset = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(offset, offset + limit);

    return jsonResponse({
      users: paginatedUsers,
      total,
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
