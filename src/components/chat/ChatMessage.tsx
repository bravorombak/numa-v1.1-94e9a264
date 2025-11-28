import { Copy, Check } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { MarkdownMessage } from "@/components/common/MarkdownMessage";
import type { MessageRow } from "@/hooks/useMessages";
import type { ChatAttachment } from "@/types/chat";
import aiAvatar from "@/assets/ai-avatar.png";

interface ChatMessageProps {
  message: MessageRow;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const { role, content, created_at, attachments } = message;
  const isUser = role === "user";
  const isAssistant = role === "assistant" || role === "system";
  
  // Cast attachments from Json to ChatAttachment[] (via unknown to satisfy TS)
  const messageAttachments = (attachments as unknown as ChatAttachment[] | undefined) ?? [];
  
  const timestamp = created_at 
    ? format(new Date(created_at), "HH:mm")
    : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "The message text has been copied.",
      });
    } catch (error) {
      console.error("Copy failed:", error);
      toast({
        title: "Failed to copy",
        description: "Your browser blocked clipboard access.",
        variant: "destructive",
      });
    }
  };

  // Assistant: Full-width layout with background strip
  if (isAssistant) {
    return (
      <div className="w-full bg-background px-4 py-6 sm:px-6 mb-0 group animate-in fade-in slide-in-from-bottom-1 duration-150">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3">
        {/* Avatar */}
        <div className="mt-1 h-7 w-7 rounded-full overflow-hidden shrink-0">
          <img src={aiAvatar} alt="Numa AI Assistant" className="h-full w-full object-cover" />
        </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <MarkdownMessage content={content} />
              
              {/* Render attachments */}
              {messageAttachments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {messageAttachments.map((att, idx) =>
                    att.type === "image" ? (
                      <div
                        key={idx}
                        className="overflow-hidden rounded-lg border bg-muted/40"
                      >
                        <img
                          src={att.url}
                          alt={att.name}
                          className="max-h-48 w-auto object-cover hover:scale-[1.02] transition-transform cursor-pointer"
                          onClick={() => window.open(att.url, '_blank')}
                        />
                      </div>
                    ) : (
                      <a
                        key={idx}
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-xs hover:bg-muted transition-colors"
                      >
                        📎
                        <span className="truncate max-w-[180px]">{att.name}</span>
                      </a>
                    )
                  )}
                </div>
              )}
              
              {/* Timestamp + Copy */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{timestamp}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded px-2 py-1 transition-all",
                    "hover:bg-background/80 hover:text-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "opacity-0 group-hover:opacity-100"
                  )}
                  aria-label="Copy message"
                >
                  {copied ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  <span className="font-medium">{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User: Bubble on the right
  return (
    <div className="flex justify-end mb-4 animate-in fade-in slide-in-from-bottom-1 duration-150">
      <div className="flex flex-col items-end max-w-[80%] gap-2 group">
        <div className="rounded-2xl bg-primary text-primary-foreground px-4 py-3">
          <MarkdownMessage 
            content={content} 
            className="prose-invert prose-p:my-1 [&>*]:text-primary-foreground"
          />
          
          {/* Render attachments */}
          {messageAttachments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {messageAttachments.map((att, idx) =>
                att.type === "image" ? (
                  <div
                    key={idx}
                    className="overflow-hidden rounded-lg border border-primary-foreground/20 bg-background/10"
                  >
                    <img
                      src={att.url}
                      alt={att.name}
                      className="max-h-48 w-auto object-cover hover:scale-[1.02] transition-transform cursor-pointer"
                      onClick={() => window.open(att.url, '_blank')}
                    />
                  </div>
                ) : (
                  <a
                    key={idx}
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-md border border-primary-foreground/20 bg-background/10 px-3 py-2 text-xs hover:bg-background/20 transition-colors text-primary-foreground"
                  >
                    📎
                    <span className="truncate max-w-[180px]">{att.name}</span>
                  </a>
                )
              )}
            </div>
          )}
        </div>
        
        {/* Timestamp + Copy */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground px-1">
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              "inline-flex items-center gap-1 rounded px-1.5 py-0.5 transition-all",
              "hover:bg-muted hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            )}
            aria-label="Copy message"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            <span className="sr-only">{copied ? "Copied" : "Copy message"}</span>
          </button>
          <span>{timestamp}</span>
        </div>
      </div>
    </div>
  );
};
