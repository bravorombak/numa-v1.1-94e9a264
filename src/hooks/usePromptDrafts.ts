import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate, Json } from '@/integrations/supabase/types';
import { useToast, toast } from '@/hooks/use-toast';

type PromptDraft = Tables<'prompt_drafts'>;
type PromptVersion = Tables<'prompt_versions'>;

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
  const navigate = useNavigate();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('prompt_drafts')
        .insert({
          title: 'Untitled Prompt',
          prompt_text: '',
          description: '',
          variables: [],
        })
        .select()
        .single();

      if (error) throw error;
      return data as PromptDraft;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['prompt-drafts'] });
      navigate(`/prompts/${data.id}/edit`);
      toast({
        title: 'Prompt created',
        description: 'Your new prompt draft is ready to edit.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating prompt',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const usePromptVersions = (promptDraftId: string) => {
  return useQuery({
    queryKey: ['prompt-versions', promptDraftId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompt_versions')
        .select('*')
        .eq('prompt_draft_id', promptDraftId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      return data as PromptVersion[];
    },
    enabled: !!promptDraftId,
  });
};

export const usePromptVersion = (id: string) => {
  return useQuery({
    queryKey: ['prompt-version', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompt_versions')
        .select(`
          *,
          categories:category_id (
            id,
            name,
            bg_color,
            text_color,
            border_color
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as PromptVersion;
    },
    enabled: !!id,
  });
};

export const usePublishPromptVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ draft }: { draft: PromptDraft }) => {
      // Get max version number for this draft
      const { data: existingVersions, error: fetchError } = await supabase
        .from('prompt_versions')
        .select('version_number')
        .eq('prompt_draft_id', draft.id)
        .order('version_number', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      const maxVersionNumber = existingVersions && existingVersions.length > 0
        ? existingVersions[0].version_number
        : 0;

      const newVersionNumber = maxVersionNumber + 1;

      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();

      // Insert new version
      const versionData: TablesInsert<'prompt_versions'> = {
        prompt_draft_id: draft.id,
        version_number: newVersionNumber,
        title: draft.title,
        description: draft.description,
        emoji: draft.emoji,
        image_url: draft.image_url,
        icon_type: draft.icon_type,
        icon_value: draft.icon_value,
        prompt_text: draft.prompt_text,
        variables: draft.variables as Json,
        category_id: draft.category_id,
        model_id: draft.model_id,
        published_at: new Date().toISOString(),
        published_by: user?.id || null,
      };

      const { data, error } = await supabase
        .from('prompt_versions')
        .insert(versionData)
        .select()
        .single();

      if (error) throw error;
      return data as PromptVersion;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['prompt-versions', data.prompt_draft_id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['published-prompts'] 
      });
      
      toast({
        title: "Version published",
        description: `Version ${data.version_number} published successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error publishing version",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Fetch all published prompt versions for Home page
export const usePublishedPrompts = () => {
  return useQuery({
    queryKey: ['published-prompts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompt_versions')
        .select(`
          id,
          title,
          description,
          emoji,
          image_url,
          icon_type,
          icon_value,
          category_id,
          model_id,
          created_at,
          published_at,
          version_number,
          prompt_draft_id,
          categories:category_id (
            id,
            name,
            bg_color,
            text_color,
            border_color
          ),
          models:model_id (
            id,
            name
          )
        `)
        .not('published_at', 'is', null)
        .order('prompt_draft_id', { ascending: true })
        .order('version_number', { ascending: false });

      if (error) throw error;

      // Deduplicate: keep only the latest version per prompt_draft_id
      const latestByDraft = new Map<string, any>();

      (data ?? []).forEach((row) => {
        const existing = latestByDraft.get(row.prompt_draft_id);
        // Explicitly compare version_number to ensure we keep the highest
        if (!existing || row.version_number > existing.version_number) {
          latestByDraft.set(row.prompt_draft_id, row);
        }
      });

      // Convert back to array
      const latestList = Array.from(latestByDraft.values());

      // Sort by published_at descending (newest first)
      latestList.sort((a, b) => {
        const aTime = a.published_at ? new Date(a.published_at).getTime() : 0;
        const bTime = b.published_at ? new Date(b.published_at).getTime() : 0;
        return bTime - aTime;
      });

      return latestList;
    },
  });
};
