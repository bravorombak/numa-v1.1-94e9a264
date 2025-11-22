import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// TODO: Move to centralized config file
const STORAGE_TOTAL_BYTES = 10 * 1024 * 1024 * 1024; // 10GB - should come from config/env

export interface StorageStats {
  usedBytes: number;
  totalBytes: number;
  percentageUsed: number;
}

export interface ClearStorageRequest {
  range: 'today' | '1-week' | '1-month' | '3-month' | '7-month' | '1-year';
}

export interface ClearStorageResponse {
  deletedCount: number;
  deletedBytes: number;
  range: string;
}

export interface StorageLog {
  id: string;
  bucket: string;
  path: string;
  content_type: string | null;
  size_bytes: number | null;
  user_id: string | null;
  created_at: string | null;
  deleted_at: string | null;
}

export interface StorageLogsParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface StorageLogsResponse {
  logs: StorageLog[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DeleteStorageLogResponse {
  id: string;
  deletedBytes: number;
  filename: string;
}

// Get storage statistics
export const useStorageStats = () => {
  return useQuery({
    queryKey: ['storage', 'stats'],
    queryFn: async () => {
      // Get total used bytes from storage_logs where deleted_at is null
      const { data: logs, error } = await supabase
        .from('storage_logs')
        .select('size_bytes')
        .is('deleted_at', null);

      if (error) throw error;

      const usedBytes = logs?.reduce((sum, log) => sum + (log.size_bytes || 0), 0) || 0;
      const totalBytes = STORAGE_TOTAL_BYTES;
      const percentageUsed = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0;

      return {
        usedBytes,
        totalBytes,
        percentageUsed,
      } as StorageStats;
    },
  });
};

// Clear storage by range (admin only)
export const useClearStorage = () => {
  const queryClient = useQueryClient();

  return useMutation<ClearStorageResponse, Error, ClearStorageRequest>({
    mutationFn: async ({ range }) => {
      const { data, error } = await supabase.functions.invoke('storage-clear', {
        body: { range },
      });

      if (error) {
        throw new Error(error.message || 'Failed to clear storage');
      }

      // Check for error envelope response
      if (data?.code && data?.message) {
        throw new Error(data.message);
      }

      return data as ClearStorageResponse;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['storage', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['storage', 'logs'] });
      
      toast({
        title: 'Storage cleared',
        description: `Deleted ${data.deletedCount} files (${formatBytes(data.deletedBytes)})`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error clearing storage',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Get storage logs with pagination
export const useStorageLogs = ({ page = 1, pageSize = 20, search = '' }: StorageLogsParams = {}) => {
  return useQuery({
    queryKey: ['storage', 'logs', page, pageSize, search],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('storage_logs')
        .select('*', { count: 'exact' })
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      // Apply search filter if provided
      if (search && search.trim()) {
        query = query.ilike('path', `%${search.trim()}%`);
      }

      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        logs: data || [],
        totalCount,
        page,
        pageSize,
        totalPages,
      } as StorageLogsResponse;
    },
  });
};

// Delete a single storage log (admin only)
export const useDeleteStorageLog = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteStorageLogResponse, Error, string>({
    mutationFn: async (logId: string) => {
      const { data, error } = await supabase.functions.invoke('storage-delete', {
        body: { id: logId },
      });

      if (error) {
        throw new Error(error.message || 'Failed to delete file');
      }

      // Check for error envelope response
      if (data?.code && data?.message) {
        throw new Error(data.message);
      }

      return data as DeleteStorageLogResponse;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['storage', 'logs'] });
      queryClient.invalidateQueries({ queryKey: ['storage', 'stats'] });
      
      toast({
        title: 'File deleted',
        description: `${data.filename} (${formatBytes(data.deletedBytes)})`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting file',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Helper function to format bytes
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
