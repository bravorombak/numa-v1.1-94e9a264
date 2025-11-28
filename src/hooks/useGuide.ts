import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export interface GuidePage {
  id: string;
  title: string;
  slug: string;
  content_md: string | null;
  parent_id: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface GuideTreeItem {
  id: string;
  title: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  children?: GuideTreeItem[];
}

export interface CreateGuidePageInput {
  title: string;
  slug?: string;
  content_md?: string;
  parent_id?: string | null;
  sort_order?: number;
  is_published?: boolean;
}

export interface UpdateGuidePageInput {
  id: string;
  title?: string;
  slug?: string;
  content_md?: string;
  parent_id?: string | null;
  sort_order?: number;
  is_published?: boolean;
}

export function useGuideTree() {
  return useQuery({
    queryKey: ["guide", "tree"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guide_pages')
        .select('id, parent_id, slug, title, sort_order, is_published, created_at, updated_at')
        .order('sort_order', { ascending: true });
      
      if (error) throw new Error("Failed to load guide pages. Please try again.");
      return (data || []) as GuideTreeItem[];
    },
    refetchOnWindowFocus: true,
  });
}

export function useGuidePage(id: string | undefined) {
  return useQuery({
    queryKey: ["guide", "page", id],
    queryFn: async () => {
      if (!id) throw new Error("Page ID is required");
      
      const { data, error } = await supabase
        .from('guide_pages')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw new Error("Failed to load guide page. Please try again.");
      if (!data) throw new Error("Page not found");
      return data as GuidePage;
    },
    enabled: !!id,
  });
}

export function useCreateGuidePage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (input: CreateGuidePageInput) => {
      const { data, error } = await supabase
        .from('guide_pages')
        .insert({
          title: input.title,
          slug: input.slug || input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          content_md: input.content_md || '',
          parent_id: input.parent_id || null,
          sort_order: input.sort_order ?? 0,
          is_published: input.is_published ?? true,
        })
        .select()
        .single();
      
      if (error) throw new Error(error.message || "Failed to create page");
      return data as GuidePage;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["guide", "tree"] });
      toast({
        title: "Page created",
        description: "Guide page created successfully",
      });
      navigate(`/guide/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create page",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateGuidePage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: UpdateGuidePageInput) => {
      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from('guide_pages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(error.message || "Failed to update page");
      return data as GuidePage;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["guide", "tree"] });
      queryClient.invalidateQueries({ queryKey: ["guide", "page", data.id] });
      toast({
        title: "Page updated",
        description: "Changes saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update page",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteGuidePage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('guide_pages')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message || "Failed to delete page");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guide", "tree"] });
      toast({
        title: "Page deleted",
        description: "Guide page deleted successfully",
      });
      navigate("/guide");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete page",
        variant: "destructive",
      });
    },
  });
}
