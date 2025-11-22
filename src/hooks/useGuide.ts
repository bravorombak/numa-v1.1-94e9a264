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
      const { data, error } = await supabase.functions.invoke("guide-tree");
      
      if (error) throw error;
      return data as GuideTreeItem[];
    },
    refetchOnWindowFocus: true,
  });
}

export function useGuidePage(id: string | undefined) {
  return useQuery({
    queryKey: ["guide", "page", id],
    queryFn: async () => {
      if (!id) throw new Error("Page ID is required");
      
      const { data, error } = await supabase.functions.invoke("guide-page", {
        body: { id },
      });
      
      if (error) throw error;
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
      const { data, error } = await supabase.functions.invoke("guide-create", {
        body: input,
      });
      
      if (error) throw error;
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
      const { data, error } = await supabase.functions.invoke("guide-update", {
        body: input,
      });
      
      if (error) throw error;
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
      const { data, error } = await supabase.functions.invoke("guide-delete", {
        body: { id },
      });
      
      if (error) throw error;
      return data;
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
