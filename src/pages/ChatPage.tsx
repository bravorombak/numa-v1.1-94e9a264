import { useParams } from "react-router-dom";
import { useSession } from "@/hooks/useSessions";
import { useAddMessage, useGenerateAssistantReply } from "@/hooks/useMessages";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatBody } from "@/components/chat/ChatBody";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

const ChatPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { data: session, isLoading, error } = useSession(sessionId || "");
  const addMessage = useAddMessage();
  const generateAssistant = useGenerateAssistantReply();

  const isBusy = isLoading || addMessage.isPending || generateAssistant.isPending;
  const isAssistantLoading = generateAssistant.isPending;

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
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <ChatHeader
        promptTitle={session.prompt_versions?.title}
        promptEmoji={session.prompt_versions?.emoji}
        promptImageUrl={session.prompt_versions?.image_url}
        modelName={session.models?.name || "Unknown model"}
        createdAt={session.created_at}
      />
      <ChatBody sessionId={sessionId || ""} isAssistantLoading={isAssistantLoading} />
      <ChatComposer 
        disabled={isBusy}
        onSend={async (message) => {
          if (!sessionId || !session) return;
          
          try {
            // Step 1: Save the user's message
            await addMessage.mutateAsync({
              sessionId,
              content: message,
            });
            
            // Step 2: Generate and save the assistant's reply
            await generateAssistant.mutateAsync({
              session,
              userMessage: message,
            });
          } catch (error) {
            // Errors are already handled by the mutation hooks
            console.error('[ChatPage] Error in message flow:', error);
          }
        }}
      />
    </div>
  );
};

export default ChatPage;
