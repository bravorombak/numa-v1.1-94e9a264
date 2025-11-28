import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface ChatHeaderProps {
  promptTitle?: string;
  promptEmoji?: string | null;
  promptImageUrl?: string | null;
  modelName?: string;
  versionNumber?: number;
  createdAt?: string;
}

export const ChatHeader = ({
  promptTitle = "Untitled prompt",
  promptEmoji,
  promptImageUrl,
  modelName,
  versionNumber,
  createdAt,
}: ChatHeaderProps) => {
  const relativeTime = createdAt
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
    : "";

  return (
    <div className="border-b bg-card p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
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
          <h1 className="text-lg font-header font-extrabold text-foreground truncate">
            {promptTitle}
          </h1>
        </div>
        <Badge 
          variant={modelName === "No model configured" ? "destructive" : "secondary"} 
          className="text-xs flex items-center gap-1 w-fit"
        >
            {versionNumber && (
              <span>v{versionNumber}</span>
            )}
            {modelName && (
              <>
                {versionNumber && <span className="mx-1">·</span>}
                <span>{modelName}</span>
              </>
            )}
            {relativeTime && (
              <>
                <span className="mx-1">·</span>
                <span>{relativeTime}</span>
              </>
            )}
          </Badge>
      </div>
    </div>
  );
};
