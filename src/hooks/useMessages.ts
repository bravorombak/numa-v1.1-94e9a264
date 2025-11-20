import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

export type MessageRow = Tables<"messages">;

export interface AddMessageArgs {
  sessionId: string;
  content: string;
}

export const useMessages = (
  sessionId: string,
  page: number = 0,
  pageSize: number = 30
) => {
  return useQuery({
    queryKey: ["messages", sessionId, page, pageSize],
    queryFn: async () => {
      const offset = page * pageSize;

      const { data, error, count } = await supabase
        .from("messages")
        .select("*", { count: "exact" })
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })
        .range(offset, offset + pageSize - 1);

      if (error) throw error;

      return {
        messages: (data as MessageRow[]) || [],
        totalCount: count ?? 0,
        hasMore: (count ?? 0) > offset + pageSize,
        hasPrevious: page > 0,
      };
    },
    enabled: !!sessionId,
  });
};

export const useAddMessage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<MessageRow, Error, AddMessageArgs>({
    mutationFn: async ({ sessionId, content }) => {
      const { data, error } = await supabase.functions.invoke(
        'sessions-add-message',
        {
          body: {
            session_id: sessionId,
            content: content,
          },
        }
      );

      if (error) throw error;
      if (!data) throw new Error('Failed to add message');
      
      return data as MessageRow;
    },
    onSuccess: (_, variables) => {
      // Invalidate messages query to trigger refetch
      queryClient.invalidateQueries({ 
        queryKey: ['messages', variables.sessionId] 
      });
    },
    onError: (error) => {
      console.error('[useAddMessage] Error:', error);
      toast({
        title: 'Failed to send message',
        description: error.message ?? 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });
};
