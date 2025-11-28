import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatComposerProps {
  disabled?: boolean;
  onSend?: (message: string, files: File[]) => void;
  maxLength?: number;
}

const MAX_ATTACHMENTS = 5;

// Auto-resize textarea to fit content
function autoGrow(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight + "px";
}

export const ChatComposer = ({ 
  disabled = false, 
  onSend,
  maxLength = 100000 
}: ChatComposerProps) => {
  const [message, setMessage] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { toast } = useToast();

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;
    
    onSend?.(trimmedMessage, pendingFiles);
    setMessage("");
    setPendingFiles([]);
    
    // Reset textarea height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const totalFiles = pendingFiles.length + files.length;
    if (totalFiles > MAX_ATTACHMENTS) {
      toast({
        title: "Too many attachments",
        description: `You can attach up to ${MAX_ATTACHMENTS} files per message.`,
        variant: "destructive",
      });
      return;
    }

    setPendingFiles((prev) => [...prev, ...files]);
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const files = Array.from(e.clipboardData.files ?? []);
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    
    if (imageFiles.length === 0) return;

    const totalFiles = pendingFiles.length + imageFiles.length;
    if (totalFiles > MAX_ATTACHMENTS) {
      e.preventDefault();
      toast({
        title: "Too many attachments",
        description: `You can attach up to ${MAX_ATTACHMENTS} files per message.`,
        variant: "destructive",
      });
      return;
    }

    e.preventDefault();
    setPendingFiles((prev) => [...prev, ...imageFiles]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-card p-3 sm:p-4">
      <div className="flex flex-col gap-2">
        {/* Pending files chips */}
        {pendingFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {pendingFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs"
              >
                <span className="truncate max-w-[120px]">{file.name}</span>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => handleRemoveFile(idx)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="flex gap-2 items-end">
          {/* Attach button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={handleAttachClick}
            disabled={disabled}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,application/pdf"
          />

          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              onInput={(e) => autoGrow(e.currentTarget)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Type your message..."
              className="flex-1 min-h-[60px] max-h-[200px] resize-none"
              rows={1}
              disabled={disabled}
            />
          </div>

          <Button 
            size="icon" 
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
