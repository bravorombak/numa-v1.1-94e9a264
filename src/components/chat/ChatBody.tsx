import { useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGenerationTimer } from "@/hooks/useGenerationTimer";
import type { MessageRow } from "@/hooks/useMessages";
import aiAvatar from "@/assets/ai-avatar.png";

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
  const seconds = useGenerationTimer(isAssistantLoading ?? false);

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
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto bg-background">
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
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto bg-background">
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
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto bg-background">
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-muted-foreground">
            No messages yet. Start the conversation below.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6">
        {/* Render messages */}
        <div className="space-y-0">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
            />
          ))}
        </div>

        {/* Show assistant loading state */}
        {isAssistantLoading && (
          <div className="w-full bg-background px-4 py-6 sm:px-6 mb-0 -mx-4 sm:-mx-6">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-3">
                <div className="relative mt-1 h-7 w-7 rounded-full overflow-hidden shrink-0">
                  <img src={aiAvatar} alt="Numa AI Assistant" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>Generating response...</span>
                    <span className="ml-1 text-xs">({seconds.toFixed(1)}s)</span>
                    <span className="inline-flex items-center gap-0.5 ml-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" />
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                    </span>
                  </div>
                  {seconds > 10 && (
                    <p className="mt-2 text-xs text-muted-foreground animate-in fade-in duration-300">
                      Still working on it, please wait... 😉
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Show assistant error state */}
        {!isAssistantLoading && assistantError && (
          <div className="w-full bg-destructive/10 px-4 py-6 sm:px-6 mb-0 -mx-4 sm:-mx-6">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-3">
                <div className="mt-1 h-7 w-7 rounded-full bg-destructive/10 flex items-center justify-center text-xs font-medium shrink-0 text-destructive">
                  !
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-destructive">Failed to generate a response.</p>
                  {assistantError && (
                    <p className="text-xs text-destructive/80 mt-1">
                      {assistantError.length > 100 ? `${assistantError.slice(0, 100)}...` : assistantError}
                    </p>
                  )}
                  {onRetryAssistant && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={onRetryAssistant}
                      className="mt-2"
                    >
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
