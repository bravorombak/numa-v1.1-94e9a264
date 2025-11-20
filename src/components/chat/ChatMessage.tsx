import type { MessageRow } from "@/hooks/useMessages";

interface ChatMessageProps {
  role: MessageRow["role"];
  content: string;
  createdAt: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
      </div>
    </div>
  );
};
