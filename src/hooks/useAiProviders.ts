import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type AiProvider = {
  id: string;
  provider: string;
  api_credential: string;
  created_at: string;
  updated_at: string;
};

export type AiProviderUpsert = {
  provider: string;
  api_credential: string;
};

export const useAiProviders = () => {
  return useQuery({
    queryKey: ["ai-providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_providers")
        .select("*")
        .order("provider", { ascending: true });

      if (error) throw error;
      return data as AiProvider[];
    },
  });
};

export const useUpsertAiProvider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AiProviderUpsert) => {
      const { error } = await supabase
        .from("ai_providers")
        .upsert(
          {
            provider: data.provider,
            api_credential: data.api_credential,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "provider" }
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-providers"] });
      toast({
        title: "Provider API key saved",
        description: "The API credential has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save API key",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
};
