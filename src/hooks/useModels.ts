import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type Model = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  provider: "openai" | "anthropic" | "google" | "perplexity" | "grok";
  provider_model: string;
  status: "active" | "inactive";
  max_tokens: number | null;
  description: string | null;
};

export type ModelInsert = Omit<Model, "id" | "created_at" | "updated_at">;
export type ModelUpdate = Partial<ModelInsert>;

export const useModels = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["models"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("models")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Model[];
    },
    enabled: options?.enabled ?? true,
  });
};

export const useCreateModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (model: ModelInsert) => {
      const { data, error } = await supabase
        .from("models")
        .insert(model)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
      toast({
        title: "Model created",
        description: "The model has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating model",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & ModelUpdate) => {
      const { data, error } = await supabase
        .from("models")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
      toast({
        title: "Model updated",
        description: "The model has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating model",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("models").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
      toast({
        title: "Model deleted",
        description: "The model has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting model",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
