import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface ChatHeaderProps {
  promptTitle?: string;
  promptEmoji?: string | null;
  promptImageUrl?: string | null;
  modelName?: string;
  createdAt?: string;
}

export const ChatHeader = ({
  promptTitle = "Untitled prompt",
  promptEmoji,
  promptImageUrl,
  modelName,
  createdAt,
}: ChatHeaderProps) => {
  const relativeTime = createdAt
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
    : "";

  return (
    <div className="border-b bg-card p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {promptEmoji && (
            <span className="text-2xl flex-shrink-0">{promptEmoji}</span>
          )}
          {!promptEmoji && promptImageUrl && (
            <img
              src={promptImageUrl}
              alt=""
              className="w-8 h-8 rounded flex-shrink-0 object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-foreground truncate">
              {promptTitle}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {modelName && (
            <Badge variant="secondary" className="text-xs">
              {modelName}
            </Badge>
          )}
          {relativeTime && (
            <span className="text-xs text-muted-foreground">{relativeTime}</span>
          )}
        </div>
      </div>
    </div>
  );
};
