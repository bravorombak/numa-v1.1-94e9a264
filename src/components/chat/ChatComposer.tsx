import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatComposerProps {
  disabled?: boolean;
  onSend?: (message: string) => void;
}

export const ChatComposer = ({ disabled = true }: ChatComposerProps) => {
  return (
    <div className="border-t bg-card p-4">
      <div className="flex gap-2 items-end">
        <Textarea
          placeholder="Type your message..."
          className="flex-1 min-h-[60px] max-h-[200px] resize-none"
          disabled={disabled}
        />
        <Button size="icon" disabled={disabled}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
