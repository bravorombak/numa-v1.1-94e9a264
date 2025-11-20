import { useState } from "react";
import { useParams } from "react-router-dom";
import { useSession, useSessionList } from "@/hooks/useSessions";
import { useAddMessage, useGenerateAssistantReply } from "@/hooks/useMessages";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatBody } from "@/components/chat/ChatBody";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { SessionSidebar } from "@/components/chat/SessionSidebar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

const ChatPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { data: session, isLoading, error } = useSession(sessionId || "");
  const addMessage = useAddMessage();
  const generateAssistant = useGenerateAssistantReply();

  // Fetch session list for sidebar
  const promptVersionId = session?.prompt_version_id;
  const { 
    data: sessionList = [], 
    isLoading: sessionListLoading, 
    isError: sessionListError 
  } = useSessionList(promptVersionId);

  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  const [assistantError, setAssistantError] = useState<string | null>(null);

  const isBusy = isLoading || addMessage.isPending || generateAssistant.isPending;
  const isAssistantLoading = generateAssistant.isPending;
  const canRetryAssistant = !!session && !!lastUserMessage && !!assistantError && !generateAssistant.isPending;

  const handleRetryAssistant = async () => {
    if (!session || !lastUserMessage) return;
    try {
      setAssistantError(null);
      await generateAssistant.mutateAsync({
        session,
        userMessage: lastUserMessage,
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
    <div className="flex h-full -mx-6 -my-6">
      {/* Session Sidebar */}
      <SessionSidebar
        sessions={sessionList}
        activeSessionId={sessionId}
        isLoading={sessionListLoading}
        isError={sessionListError}
      />

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-w-0">
        <ChatHeader
          promptTitle={session.prompt_versions?.title}
          promptEmoji={session.prompt_versions?.emoji}
          promptImageUrl={session.prompt_versions?.image_url}
          modelName={session.models?.name || "Unknown model"}
          createdAt={session.created_at}
        />
        <ChatBody 
          sessionId={sessionId || ""} 
          isAssistantLoading={isAssistantLoading}
          assistantError={assistantError}
          onRetryAssistant={canRetryAssistant ? handleRetryAssistant : undefined}
        />
        <ChatComposer 
          disabled={isBusy}
          onSend={async (message) => {
            if (!sessionId || !session) return;
            
            // Step 1: Save the user's message
            await addMessage.mutateAsync({
              sessionId,
              content: message,
            });
            
            // Step 2: Track last user message for retry
            setLastUserMessage(message);
            setAssistantError(null);
            
            // Step 3: Trigger assistant generation
            try {
              await generateAssistant.mutateAsync({
                session,
                userMessage: message,
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
