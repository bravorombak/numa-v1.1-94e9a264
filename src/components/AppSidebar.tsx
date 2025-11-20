import { Home, Users, HardDrive, FolderTree, Settings, BookOpen, MessageSquare, Clock, AlertCircle, Loader2 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useMatch, useNavigate } from "react-router-dom";
import { useSession, useSessionList } from "@/hooks/useSessions";
import { formatDistanceToNow, format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Team", url: "/team", icon: Users },
  { title: "Storage", url: "/storage", icon: HardDrive },
  { title: "Categories", url: "/categories/edit", icon: FolderTree },
  { title: "Model Registry", url: "/admin/api", icon: Settings },
  { title: "Guide", url: "/guide", icon: BookOpen },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const navigate = useNavigate();
  const match = useMatch("/chat/:sessionId");
  const sessionId = match?.params.sessionId;

  // Fetch current session and session list (only when on chat route)
  const { data: currentSession } = useSession(sessionId);
  const promptVersionId = currentSession?.prompt_version_id;
  const { 
    data: sessionList = [], 
    isLoading: sessionListLoading, 
    isError: sessionListError 
  } = useSessionList(promptVersionId);

  // Helper function for session titles
  const getSessionTitle = (createdAt: string) => {
    return `Session on ${format(new Date(createdAt), "dd MMM, HH:mm")}`;
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3"
                      activeClassName="bg-accent text-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sessions Group (only shown when on /chat/:sessionId) */}
        {sessionId && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel>
              {open ? "Sessions" : <MessageSquare className="h-4 w-4" />}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {sessionListLoading && open && (
                <div className="space-y-2 px-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              )}

              {sessionListError && open && (
                <Alert variant="destructive" className="mx-2 mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Couldn't load sessions.
                  </AlertDescription>
                </Alert>
              )}

              {!sessionListLoading && !sessionListError && sessionList.length === 0 && open && (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  No sessions yet
                </div>
              )}

              {!sessionListLoading && !sessionListError && sessionList.length > 0 && open && (
                <ScrollArea className="mt-2 max-h-72">
                  <SidebarMenu>
                    {sessionList.map((session) => {
                      const isActive = session.id === sessionId;
                      const relativeTime = formatDistanceToNow(new Date(session.created_at), { 
                        addSuffix: true 
                      });

                      return (
                        <SidebarMenuItem key={session.id}>
                          <SidebarMenuButton
                            onClick={() => navigate(`/chat/${session.id}`)}
                            className={cn(
                              "w-full px-3 py-3 rounded-lg transition-colors hover:bg-muted",
                              isActive && "bg-accent text-accent-foreground font-medium border border-border"
                            )}
                          >
                            <div className="flex items-start gap-2 w-full">
                              <MessageSquare className="h-4 w-4 flex-shrink-0 mt-0.5" />
                              {open && (
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm truncate">
                                    {getSessionTitle(session.created_at)}
                                  </p>
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <Clock className="h-3 w-3" />
                                    <span className="text-xs opacity-70">
                                      {relativeTime}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </ScrollArea>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
