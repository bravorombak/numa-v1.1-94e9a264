import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type MessageRow = Tables<"messages">;

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
