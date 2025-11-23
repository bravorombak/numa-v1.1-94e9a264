import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

export type AppRole = 'admin' | 'editor' | 'user';

export interface UserRoleResolution {
  requesterRole: AppRole;
  allRoles: AppRole[];
}

export async function resolveUserRole(
  userId: string,
  serviceSupabase: SupabaseClient
): Promise<UserRoleResolution> {
  const { data: userRoles, error: roleError } = await serviceSupabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);

  if (roleError || !userRoles || userRoles.length === 0) {
    return {
      requesterRole: 'user',
      allRoles: [],
    };
  }

  const allRoles = userRoles.map((r: any) => r.role as AppRole);

  const hasAdminRole = allRoles.includes('admin');
  const hasEditorRole = allRoles.includes('editor');

  const requesterRole: AppRole =
    hasAdminRole ? 'admin' : hasEditorRole ? 'editor' : 'user';

  return { requesterRole, allRoles };
}

