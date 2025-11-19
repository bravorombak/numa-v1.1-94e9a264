import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface GenerateRequest {
  // Canonical contract
  prompt: string;
  variables: Record<string, any>;
  model_id: string;
  files?: any[];

  // Optional convenience fields for Prompt Editor
  prompt_draft_id?: string;
  model_override_id?: string;
}

export interface GenerateResponse {
  output: string;
  usage: { tokens: number };
}

export interface GenerateError {
  code: string;
  message: string;
  details: any;
  requestId: string;
}

export const useGenerate = () => {
  return useMutation<GenerateResponse, GenerateError, GenerateRequest>({
    mutationFn: async (request) => {
      const { data, error } = await supabase.functions.invoke('generate', {
        body: request,
      });

      if (error) {
        throw {
          code: 'NETWORK_ERROR',
          message: error.message || 'Failed to connect to generation service',
          details: null,
          requestId: crypto.randomUUID(),
        };
      }

      if (data?.code && data?.message) {
        // Error envelope from backend
        throw data as GenerateError;
      }

      return data as GenerateResponse;
    },
    onError: (error) => {
      if (error.code === 'NETWORK_ERROR' || error.code === 'INTERNAL_ERROR') {
        toast({
          title: 'Generation failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    },
  });
};
