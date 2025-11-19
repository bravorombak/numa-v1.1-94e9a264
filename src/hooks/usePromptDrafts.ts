import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type PromptDraft = Tables<'prompt_drafts'>;

export const usePromptDraft = (id: string) => {
  return useQuery({
    queryKey: ['prompt-draft', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompt_drafts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as PromptDraft;
    },
    enabled: !!id,
  });
};

export const useSavePromptDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (draft: TablesUpdate<'prompt_drafts'> & { id: string }) => {
      const { id, ...updates } = draft;
      const { data, error } = await supabase
        .from('prompt_drafts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as PromptDraft;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['prompt-draft', data.id] });
    },
  });
};

export const useCreatePromptDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (draft: TablesInsert<'prompt_drafts'>) => {
      const { data, error } = await supabase
        .from('prompt_drafts')
        .insert(draft)
        .select()
        .single();

      if (error) throw error;
      return data as PromptDraft;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompt-drafts'] });
    },
  });
};
