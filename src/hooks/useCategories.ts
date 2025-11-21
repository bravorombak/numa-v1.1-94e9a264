import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type Category = Tables<'categories'>;

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
  });
};

// CREATE mutation
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      bg_color: string;
      text_color: string;
      border_color: string;
    }) => {
      const { data: result, error } = await supabase
        .from('categories')
        .insert({
          name: data.name,
          bg_color: data.bg_color,
          text_color: data.text_color,
          border_color: data.border_color,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: 'Category created',
        description: 'The category has been created successfully.',
      });
    },
    onError: (error: any) => {
      console.error('Create category error:', error);
      toast({
        title: 'Failed to create category',
        description: error.message ?? 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });
};

// UPDATE mutation
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        name: string;
        bg_color: string;
        text_color: string;
        border_color: string;
      };
    }) => {
      const { data: result, error } = await supabase
        .from('categories')
        .update({
          name: data.name,
          bg_color: data.bg_color,
          text_color: data.text_color,
          border_color: data.border_color,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: 'Category updated',
        description: 'The category has been updated successfully.',
      });
    },
    onError: (error: any) => {
      console.error('Update category error:', error);
      toast({
        title: 'Failed to update category',
        description: error.message ?? 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });
};

// DELETE mutation (hard delete with prompt uncategorization)
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      // Set all prompt_drafts with this category to NULL (uncategorized)
      const { error: draftsError } = await supabase
        .from('prompt_drafts')
        .update({ category_id: null })
        .eq('category_id', id);

      if (draftsError) throw draftsError;

      // Set all prompt_versions with this category to NULL (uncategorized)
      const { error: versionsError } = await supabase
        .from('prompt_versions')
        .update({ category_id: null })
        .eq('category_id', id);

      if (versionsError) throw versionsError;

      // Hard delete the category
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: 'Category deleted',
        description: 'Category deleted and prompts set to uncategorized.',
      });
    },
    onError: (error: any) => {
      console.error('Delete category error:', error);
      toast({
        title: 'Failed to delete category',
        description: error.message ?? 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });
};
