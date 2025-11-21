import { useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MessageRow {
  content: string;
  created_at: string;
  id: string;
  role: "assistant" | "system" | "user";
  session_id: string;
}

interface ChatBodyProps {
  sessionId: string;
  messages: MessageRow[];
  isLoading: boolean;
  error: Error | null;
  isAssistantLoading?: boolean;
  assistantError?: string | null;
  onRetryAssistant?: () => void;
}

export const ChatBody = ({ 
  sessionId, 
  messages, 
  isLoading, 
  error, 
  isAssistantLoading, 
  assistantError, 
  onRetryAssistant 
}: ChatBodyProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const isNearBottom = () => {
    if (!scrollRef.current) return true;
    const el = scrollRef.current;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  useEffect(() => {
    if (isNearBottom()) {
      scrollToBottom();
    }
  }, [messages.length, isAssistantLoading, assistantError]);

  if (isLoading) {
    return (
      <div ref={scrollRef} className="flex-1 overflow-auto bg-background">
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div ref={scrollRef} className="flex-1 overflow-auto bg-background">
        <div className="flex items-center justify-center h-full p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load messages. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !isAssistantLoading) {
    return (
      <div ref={scrollRef} className="flex-1 overflow-auto bg-background">
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-muted-foreground">
            No messages yet. Start the conversation below.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-auto bg-background">
      <div className="max-w-4xl mx-auto p-4">
        {/* Render messages */}
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              createdAt={message.created_at}
            />
          ))}
        </div>

        {/* Show assistant loading state */}
        {isAssistantLoading && (
          <div className="flex items-start gap-3 mt-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm">🤖</span>
            </div>
            <div className="flex-1 bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Assistant is thinking...</p>
              </div>
            </div>
          </div>
        )}

        {/* Show assistant error state */}
        {!isAssistantLoading && assistantError && (
          <div className="flex items-start gap-3 mt-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm">🤖</span>
            </div>
            <div className="flex-1 bg-destructive/10 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-destructive">
                    Failed to generate a response.
                  </p>
                  <p className="text-xs text-destructive/80 break-words">
                    {assistantError}
                  </p>
                </div>
              </div>
              {onRetryAssistant && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetryAssistant}
                  className="w-full sm:w-auto"
                >
                  Retry
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
