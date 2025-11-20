import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type Session = Tables<"sessions">;
type SessionInsert = TablesInsert<"sessions">;

export interface SessionWithRelations extends Tables<"sessions"> {
  prompt_versions: Tables<"prompt_versions"> | null;
  models: Tables<"models"> | null;
}

export interface CreateSessionInput {
  promptVersionId: string;
  variables: Record<string, any>;
  modelId?: string;
}

export const useCreateSession = () => {
  const { toast } = useToast();

  return useMutation<Session, unknown, CreateSessionInput>({
    mutationFn: async (input: CreateSessionInput): Promise<Session> => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to create a session");
      }

      // Build insert payload
      const insertPayload: SessionInsert = {
        user_id: user.id,
        prompt_version_id: input.promptVersionId,
        variable_inputs: input.variables as any,
        model_id: input.modelId ?? null,
      };

      // Insert session
      const { data, error } = await supabase
        .from("sessions")
        .insert(insertPayload)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Failed to create session");
      }

      return data as Session;
    },
    onError: (error: any) => {
      console.error("Session creation error:", error);
      toast({
        title: "Failed to start session",
        description: error.message ?? "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
};

export const useSession = (sessionId: string) => {
  return useQuery<SessionWithRelations>({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select(`
          *,
          prompt_versions(*),
          models(*)
        `)
        .eq("id", sessionId)
        .single();

      if (error) throw error;
      return data as SessionWithRelations;
    },
    enabled: !!sessionId,
  });
};
