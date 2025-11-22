import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSession } from "@/hooks/useSessions";
import { useAddMessage, useGenerateAssistantReply, useMessages } from "@/hooks/useMessages";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatBody } from "@/components/chat/ChatBody";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

const ChatPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { data: session, isLoading, error } = useSession(sessionId);
  const addMessage = useAddMessage();
  const generateAssistant = useGenerateAssistantReply();
  
  // Fetch messages at page level to share with both ChatBody and auto-start logic
  const { data: messagesData, isLoading: messagesLoading, error: messagesError } = useMessages(sessionId || "", 0, 30);
  const messages = messagesData?.messages ?? [];

  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  const [assistantError, setAssistantError] = useState<string | null>(null);
  const autoStartTriggered = useRef(false);

  const isBusy = isLoading || addMessage.isPending || generateAssistant.isPending;
  const isAssistantLoading = generateAssistant.isPending;
  const canRetryAssistant = !!session && !!lastUserMessage && !!assistantError && !generateAssistant.isPending;

  // Auto-start: Trigger first assistant reply on empty sessions
  useEffect(() => {
    if (
      session &&
      messagesData &&
      messages.length === 0 &&
      session.model_id &&
      !autoStartTriggered.current &&
      !generateAssistant.isPending
    ) {
      autoStartTriggered.current = true;
      
      generateAssistant.mutateAsync({
        session,
        userMessage: "",
        conversationHistory: [],
      }).catch((error) => {
        console.error('[ChatPage] Auto-start generation error:', error);
        setAssistantError(
          error instanceof Error ? error.message : "Failed to generate initial response"
        );
      });
    }
  }, [session, messagesData, messages.length, generateAssistant]);

  const handleRetryAssistant = async () => {
    if (!session || !lastUserMessage) return;
    try {
      setAssistantError(null);
      await generateAssistant.mutateAsync({
        session,
        userMessage: lastUserMessage,
        conversationHistory: messages,
      });
    } catch (error) {
      setAssistantError(
        error instanceof Error ? error.message : "Failed to generate response"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Session not found</AlertTitle>
          <AlertDescription>
            This session doesn't exist or you don't have access to it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] min-h-0 overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0 rounded-lg border bg-background overflow-hidden">
        <ChatHeader
          promptTitle={session.prompt_versions?.title}
          promptEmoji={session.prompt_versions?.emoji}
          promptImageUrl={session.prompt_versions?.image_url}
          modelName={
            session.models?.name || 
            (session.model_id ? "Model not found" : "No model configured")
          }
          versionNumber={session.prompt_versions?.version_number}
          createdAt={session.created_at}
        />
        
        {/* Warning banner for missing model */}
        {!session.model_id && (
          <Alert variant="destructive" className="mx-4 mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No AI model configured</AlertTitle>
            <AlertDescription>
              This session was created without an AI model. Please go back to the prompt editor, select a model in the Model tab, and run the prompt again.
            </AlertDescription>
          </Alert>
        )}

        <ChatBody 
          sessionId={sessionId || ""} 
          messages={messages}
          isLoading={messagesLoading}
          error={messagesError}
          isAssistantLoading={isAssistantLoading}
          assistantError={assistantError}
          onRetryAssistant={canRetryAssistant ? handleRetryAssistant : undefined}
        />
        <ChatComposer 
          disabled={isBusy || !session.model_id}
          onSend={async (message) => {
            if (!sessionId || !session || !session.model_id) return;
            
            // Step 1: Save the user's message
            await addMessage.mutateAsync({
              sessionId,
              content: message,
            });
            
            // Step 2: Track last user message for retry
            setLastUserMessage(message);
            setAssistantError(null);
            
            // Step 3: Trigger assistant generation with conversation history
            try {
              await generateAssistant.mutateAsync({
                session,
                userMessage: message,
                conversationHistory: messages,
              });
            } catch (error) {
              console.error('[ChatPage] Assistant generation error:', error);
              setAssistantError(
                error instanceof Error ? error.message : "Failed to generate response"
              );
            }
          }}
        />
      </div>
    </div>
  );
};

export default ChatPage;
