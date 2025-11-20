import { useParams } from "react-router-dom";
import { useSession } from "@/hooks/useSessions";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatBody } from "@/components/chat/ChatBody";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

const ChatPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { data: session, isLoading, error } = useSession(sessionId || "");

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
      <ChatBody sessionId={sessionId || ""} />
      <ChatComposer 
        disabled={false}
        onSend={(message) => {
          console.log("[Phase 8.3] Message sent:", message);
        }}
      />
    </div>
  );
};

export default ChatPage;
