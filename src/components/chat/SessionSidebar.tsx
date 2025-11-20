import { formatDistanceToNow, format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, MessageSquare, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionListItem } from "@/hooks/useSessions";

interface SessionSidebarProps {
  sessions: SessionListItem[];
  activeSessionId?: string;
  isLoading: boolean;
  isError: boolean;
}

export const SessionSidebar = ({ 
  sessions, 
  activeSessionId, 
  isLoading, 
  isError 
}: SessionSidebarProps) => {
  const navigate = useNavigate();

  // Generate fallback title from timestamp
  const getSessionTitle = (createdAt: string) => {
    return `Session on ${format(new Date(createdAt), "dd MMM, HH:mm")}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-[280px] border-r bg-muted/30 p-4 space-y-3">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Sessions</h2>
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="w-[280px] border-r bg-muted/30 p-4">
        <div className="space-y-2 mb-4">
          <h2 className="text-sm font-semibold text-foreground">Sessions</h2>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Couldn't load your sessions. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Empty state
  if (sessions.length === 0) {
    return (
      <div className="w-[280px] border-r bg-muted/30 p-4">
        <div className="space-y-2 mb-4">
          <h2 className="text-sm font-semibold text-foreground">Sessions</h2>
        </div>
        <div className="text-center py-8 text-sm text-muted-foreground">
          No sessions yet
        </div>
      </div>
    );
  }

  // Main session list
  return (
    <div className="w-[280px] border-r bg-muted/30 flex flex-col h-full hidden md:flex">
      <div className="p-4 border-b">
        <h2 className="text-sm font-semibold text-foreground">Sessions</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {sessions.length} session{sessions.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            const relativeTime = formatDistanceToNow(new Date(session.created_at), { 
              addSuffix: true 
            });

            return (
              <button
                key={session.id}
                onClick={() => navigate(`/chat/${session.id}`)}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-colors",
                  "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring",
                  isActive && "bg-muted font-medium border border-border"
                )}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">
                      {getSessionTitle(session.created_at)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {relativeTime}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
