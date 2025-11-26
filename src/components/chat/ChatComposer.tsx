import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatComposerProps {
  disabled?: boolean;
  onSend?: (message: string) => void;
  maxLength?: number;
}

export const ChatComposer = ({ 
  disabled = false, 
  onSend,
  maxLength = 4000 
}: ChatComposerProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;
    
    onSend?.(trimmedMessage);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-card p-3 sm:p-4">
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => {
              if (e.target.value.length <= maxLength) {
                setMessage(e.target.value);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 min-h-[60px] max-h-[200px] resize-none pr-16"
            disabled={disabled}
          />
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            {message.length} / {maxLength}
          </div>
        </div>
        <Button 
          size="icon" 
          onClick={handleSend}
          disabled={disabled || !message.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
