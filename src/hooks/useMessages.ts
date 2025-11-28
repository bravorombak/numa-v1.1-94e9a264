import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import type { SessionWithRelations } from "./useSessions";
import type { ChatAttachment } from "@/types/chat";

export type MessageRow = Tables<"messages">;

export interface AddMessageArgs {
  sessionId: string;
  content: string;
  attachments?: ChatAttachment[];
}

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

export const useAddMessage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<MessageRow, Error, AddMessageArgs>({
    mutationFn: async ({ sessionId, content, attachments }) => {
      const { data, error } = await supabase.functions.invoke(
        'sessions-add-message',
        {
          body: {
            session_id: sessionId,
            content: content,
            attachments: attachments ?? [],
          },
        }
      );

      if (error) throw error;
      if (!data) throw new Error('Failed to add message');
      
      return data as MessageRow;
    },
    onSuccess: (_, variables) => {
      // Invalidate messages query to trigger refetch
      queryClient.invalidateQueries({ 
        queryKey: ['messages', variables.sessionId] 
      });
    },
    onError: (error) => {
      console.error('[useAddMessage] Error:', error);
      toast({
        title: 'Failed to send message',
        description: error.message ?? 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });
};

export interface GenerateAssistantReplyArgs {
  session: SessionWithRelations;
  userMessage: string;
  conversationHistory?: MessageRow[];
  latestAttachments?: ChatAttachment[];
}

export const useGenerateAssistantReply = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<MessageRow, Error, GenerateAssistantReplyArgs>({
    mutationFn: async ({ session, userMessage, conversationHistory = [], latestAttachments = [] }) => {
      // Early validation: prevent calling generate without model_id
      if (!session.model_id) {
        throw new Error(
          'This session has no AI model configured. Please start a new session from a prompt with a model selected.'
        );
      }

      // Step 1: Construct the generate request with conversation history
      const promptTemplate = session.prompt_versions?.prompt_text || '';
      const baseVariables = (session.variable_inputs as Record<string, any>) || {};
      
      // Build conversation array from history (text-only for now)
      const conversation = conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
      
      const generateRequest = {
        prompt: promptTemplate,
        variables: {
          ...baseVariables,
          chat_message: userMessage,
        },
        model_id: session.model_id,
        conversation,
        latestAttachments,
      };

      // Step 2: Call the generate edge function
      const { data: generateData, error: generateError } = await supabase.functions.invoke(
        'generate',
        {
          body: generateRequest,
        }
      );

      if (generateError) {
        console.error('[useGenerateAssistantReply] Generate error:', generateError);
        throw new Error(generateError.message || 'Failed to generate assistant response');
      }

      if (!generateData || !generateData.output) {
        throw new Error('No output received from generate function');
      }

      const assistantOutput = generateData.output;

      // Step 3: Save the assistant's reply as a message
      const { data: messageData, error: messageError } = await supabase.functions.invoke(
        'sessions-add-message',
        {
          body: {
            session_id: session.id,
            role: 'assistant',
            content: assistantOutput,
          },
        }
      );

      if (messageError) {
        console.error('[useGenerateAssistantReply] Message save error:', messageError);
        throw new Error(messageError.message || 'Failed to save assistant message');
      }

      if (!messageData) {
        throw new Error('Failed to save assistant message');
      }

      return messageData as MessageRow;
    },
    onSuccess: (_, variables) => {
      // Invalidate messages query to show the new assistant message
      queryClient.invalidateQueries({ 
        queryKey: ['messages', variables.session.id] 
      });
    },
    onError: (error) => {
      console.error('[useGenerateAssistantReply] Error:', error);
      toast({
        title: 'Failed to generate response',
        description: error.message || 'The assistant could not generate a response. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
