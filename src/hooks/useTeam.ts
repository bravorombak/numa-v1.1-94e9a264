import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// ============================================================================
// Types
// ============================================================================

export type AppRole = 'admin' | 'editor' | 'user';

export interface TeamMember {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  roles: string[];
  resolved_role: AppRole;
  created_at: string | null;
  last_sign_in_at: string | null;
  banned: boolean;
}

export interface TeamListResponse {
  users: TeamMember[];
  total: number;
  page: number;
  limit: number;
}

export interface TeamListFilters {
  role?: AppRole | 'all';
  search?: string;
  page?: number;
  limit?: number;
  status?: 'all' | 'active' | 'deactivated';
}

export interface CreateTeamMemberPayload {
  email: string;
  password: string;
  full_name?: string;
  role: AppRole;
}

export interface UpdateTeamMemberPayload {
  user_id: string;
  updates: {
    full_name?: string;
    role?: AppRole;
    avatar_url?: string;
    password?: string;
  };
}

export interface DeactivateTeamMemberPayload {
  user_id: string;
}

export interface ReactivateTeamMemberPayload {
  user_id: string;
}

export interface ResetPasswordPayload {
  user_id: string;
}

export interface TeamError {
  code: string;
  message: string;
  details?: any;
  requestId?: string;
}

// ============================================================================
// Query Key Factory
// ============================================================================

const teamQueryKeys = {
  all: ['team'] as const,
  members: (filters?: TeamListFilters) => ['team', 'members', filters] as const,
};

// ============================================================================
// Error Handling Helpers
// ============================================================================

function parseTeamError(error: any, data: any): TeamError {
  // Check for Supabase network error first
  if (error) {
    return {
      code: 'NETWORK_ERROR',
      message: error.message || 'Failed to connect to team management service',
      details: null,
      requestId: crypto.randomUUID(),
    };
  }

  // Check if data contains error envelope from backend
  if (data?.code && data?.message) {
    return data as TeamError;
  }

  // Fallback for unexpected errors
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    details: null,
    requestId: crypto.randomUUID(),
  };
}

function getErrorMessage(error: TeamError): string {
  // Map known error codes to user-friendly messages
  switch (error.code) {
    case 'NETWORK_ERROR':
      return 'Failed to connect to the server. Please check your connection.';
    case 'UNAUTHORIZED':
      return 'You are not logged in. Please sign in and try again.';
    case 'FORBIDDEN':
      return 'You do not have permission to perform this action.';
    case 'USER_ALREADY_EXISTS':
      return 'A user with this email already exists.';
    case 'INVALID_ROLE':
      return 'Invalid role specified. Must be admin, editor, or user.';
    case 'CANNOT_MODIFY_SELF':
      return 'You cannot modify your own account through team management.';
    case 'CANNOT_DELETE_SOLE_ADMIN':
      return 'Cannot remove the last admin. At least one admin must remain.';
    case 'USER_NOT_FOUND':
      return 'User not found. They may have been removed.';
    case 'INTERNAL_ERROR':
      return error.message || 'An internal error occurred. Please try again.';
    default:
      return error.message || 'An error occurred. Please try again.';
  }
}

// ============================================================================
// Query Hook: useTeamMembers
// ============================================================================

export const useTeamMembers = (filters?: TeamListFilters, enabled: boolean = true) => {
  return useQuery<TeamListResponse, TeamError>({
    queryKey: teamQueryKeys.members(filters),
    queryFn: async () => {
    const { data, error } = await supabase.functions.invoke('admin-team-list', {
      body: {
        role: filters?.role === 'all' ? undefined : filters?.role,
        search: filters?.search ?? undefined,
        page: filters?.page ?? 1,
        limit: filters?.limit ?? 20,
        status: filters?.status === 'all' ? undefined : filters?.status,
      },
    });

      // Parse and throw error if present
      const teamError = parseTeamError(error, data);
      if (error || data?.code) {
        throw teamError;
      }

      return data as TeamListResponse;
    },
    enabled,
  });
};

// ============================================================================
// Mutation Hook: useCreateTeamMember
// ============================================================================

export interface CreateTeamMemberResponse {
  id: string;
  email: string | null;
  full_name: string | null;
  role: AppRole;
  roles: string[];
  resolved_role: AppRole;
  user_created: boolean;
  role_added: boolean;
}

export const useCreateTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateTeamMemberResponse, TeamError, CreateTeamMemberPayload>({
    mutationFn: async (payload) => {
      const { data, error } = await supabase.functions.invoke('admin-team-create', {
        body: payload,
      });

      // Parse and throw error if present
      const teamError = parseTeamError(error, data);
      if (error || data?.code) {
        throw teamError;
      }

      return data as CreateTeamMemberResponse;
    },
    onSuccess: (data) => {
      // Invalidate all team member queries
      queryClient.invalidateQueries({
        queryKey: ['team', 'members'],
        exact: false,
      });

      // Show success toast
      if (data.user_created) {
        toast({
          title: 'Team member created',
          description: 'The new team member can now log in with their credentials.',
        });
      } else if (data.role_added) {
        toast({
          title: 'Existing team member updated',
          description: 'The new role has been added to their account.',
        });
      }
    },
    onError: (error) => {
      // Show error toast with user-friendly message
      toast({
        title: 'Failed to create team member',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });
};

// ============================================================================
// Mutation Hook: useUpdateTeamMember
// ============================================================================

export const useUpdateTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation<TeamMember, TeamError, UpdateTeamMemberPayload>({
    mutationFn: async (payload) => {
      const { data, error } = await supabase.functions.invoke('admin-team-update', {
        body: payload,
      });

      // Parse and throw error if present
      const teamError = parseTeamError(error, data);
      if (error || data?.code) {
        throw teamError;
      }

      return data as TeamMember;
    },
    onSuccess: (_data, variables) => {
      // Invalidate all team member queries
      queryClient.invalidateQueries({
        queryKey: ['team', 'members'],
        exact: false,
      });

      const passwordChanged = !!variables.updates.password;

      // Show success toast
      toast({
        title: 'Team member updated',
        description: passwordChanged
          ? 'The team member details and password have been updated successfully.'
          : 'The team member has been updated successfully.',
      });
    },
    onError: (error) => {
      // Show error toast with user-friendly message
      toast({
        title: 'Failed to update team member',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });
};

// ============================================================================
// Mutation Hook: useDeactivateTeamMember
// ============================================================================

export const useDeactivateTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; user_id: string },
    TeamError,
    DeactivateTeamMemberPayload
  >({
    mutationFn: async (payload) => {
      const { data, error } = await supabase.functions.invoke('admin-team-deactivate', {
        body: payload,
      });

      const teamError = parseTeamError(error, data);
      if (error || (data as any)?.code) {
        throw teamError;
      }

      return data as { message: string; user_id: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['team', 'members'],
        exact: false,
      });

      toast({
        title: 'Team member deactivated',
        description: 'The team member has been deactivated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to deactivate team member',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });
};

export const useReactivateTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; user_id: string },
    TeamError,
    ReactivateTeamMemberPayload
  >({
    mutationFn: async (payload) => {
      const { data, error } = await supabase.functions.invoke('admin-team-reactivate', {
        body: payload,
      });

      const teamError = parseTeamError(error, data);
      if (error || (data as any)?.code) {
        throw teamError;
      }

      return data as { message: string; user_id: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['team', 'members'],
        exact: false,
      });

      toast({
        title: 'Team member reactivated',
        description: 'The team member has been reactivated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to reactivate team member',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to send a password reset email to a team member
 */
export const useResetTeamMemberPassword = () => {
  return useMutation<
    { message: string; user_id: string; email: string },
    TeamError,
    ResetPasswordPayload
  >({
    mutationFn: async (payload) => {
      const { data, error } = await supabase.functions.invoke('admin-team-reset-password', {
        body: payload,
      });

      const teamError = parseTeamError(error, data);
      if (error || (data as any)?.code) {
        throw teamError;
      }

      return data as { message: string; user_id: string; email: string };
    },
    onSuccess: () => {
      toast({
        title: 'Password reset email sent',
        description: 'The team member will receive an email to set a new password.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to send password reset email',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });
};
