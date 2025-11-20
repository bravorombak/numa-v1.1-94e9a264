import { useState, useRef, useEffect } from "react";
import { useMessages } from "@/hooks/useMessages";
import { ChatMessage } from "./ChatMessage";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChatBodyProps {
  sessionId: string;
  isAssistantLoading?: boolean;
  assistantError?: string | null;
  onRetryAssistant?: () => void;
}

export const ChatBody = ({ sessionId, isAssistantLoading, assistantError, onRetryAssistant }: ChatBodyProps) => {
  const [page, setPage] = useState(0);
  const pageSize = 30;
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, isError } = useMessages(sessionId, page, pageSize);

  const messages = data?.messages ?? [];
  const hasMore = data?.hasMore ?? false;
  const hasPrevious = data?.hasPrevious ?? false;

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
      <div className="flex-1 overflow-auto bg-background">
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
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

  if (messages.length === 0) {
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
        {/* Pagination controls at top */}
        {(hasPrevious || hasMore) && (
          <div className="flex justify-center gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={!hasPrevious}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Message list */}
        <div className="space-y-2">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              createdAt={message.created_at}
            />
          ))}
          
          {/* Assistant thinking indicator */}
          {isAssistantLoading && (
            <div className="flex justify-start mb-4">
              <div className="max-w-[70%] rounded-lg px-4 py-3 bg-muted/50 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse" style={{ animationDelay: '0ms' }} />
                    <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse" style={{ animationDelay: '150ms' }} />
                    <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm">Assistant is thinking...</span>
                </div>
              </div>
            </div>
          )}

          {/* Assistant error indicator with retry */}
          {!isAssistantLoading && assistantError && (
            <div className="flex justify-start mb-4">
              <div className="max-w-[70%] rounded-lg px-4 py-3 bg-destructive/10 text-destructive text-sm flex flex-col gap-2">
                <span>Failed to generate a response.</span>
                <div className="flex items-center gap-2">
                  {onRetryAssistant && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={onRetryAssistant}
                    >
                      Retry
                    </Button>
                  )}
                  <span className="text-[11px] text-muted-foreground truncate">
                    {assistantError}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pagination controls at bottom */}
        {(hasPrevious || hasMore) && (
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={!hasPrevious}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
