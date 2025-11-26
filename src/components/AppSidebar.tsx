import { useState } from "react";
import { Home, Users, HardDrive, FolderTree, Settings, BookOpen, MessageSquare, MoreVertical, Edit2, Trash2, Plus } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useMatch, useNavigate } from "react-router-dom";
import { useAllUserSessions, useRenameSession, useDeleteSession } from "@/hooks/useSessions";
import { useCreatePromptDraft } from "@/hooks/usePromptDrafts";
import { useAuthStore } from "@/stores/authStore";
import type { SessionListItemWithPrompt } from "@/hooks/useSessions";
import { formatDistanceToNow, format } from "date-fns";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
  const { profile } = useAuthStore();
  const role = profile?.role || 'user';
  
  const createPrompt = useCreatePromptDraft();
  
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTargetSession, setDeleteTargetSession] = useState<SessionListItemWithPrompt | null>(null);
  const renameSession = useRenameSession();
  const deleteSession = useDeleteSession();

  // Fetch all user sessions (always, not just on chat route)
  const { 
    data: sessionList = [], 
    isLoading: sessionListLoading, 
    isError: sessionListError 
  } = useAllUserSessions();

  // Helper function for session titles (prioritizes prompt title)
  const getSessionTitle = (session: SessionListItemWithPrompt) => {
    // Priority 1: Custom session title
    if (session.title && session.title.trim().length > 0) {
      return session.title.trim();
    }

    // Priority 2: Prompt version title
    if (session.prompt_versions?.title?.trim()) {
      return session.prompt_versions.title.trim();
    }

    // Priority 3: Prompt draft title (via prompt_versions)
    if (session.prompt_versions?.prompt_drafts?.title?.trim()) {
      return session.prompt_versions.prompt_drafts.title.trim();
    }

    // Fallback: Date-based title
    return `Session on ${format(new Date(session.created_at), "dd MMM, HH:mm")}`;
  };

  // Helper to render prompt icon from prompt_versions or draft
  const renderSessionIcon = (session: SessionListItemWithPrompt) => {
    const pv = session.prompt_versions;
    const draft = pv?.prompt_drafts;

    // Priority 1: icon_type + icon_value from prompt_versions
    if (pv?.icon_type === 'image' && pv?.icon_value) {
      return (
        <img
          src={pv.icon_value}
          alt=""
          className="h-4 w-4 rounded-sm object-cover"
        />
      );
    }
    if (pv?.icon_type === 'emoji' && pv?.icon_value) {
      return <span>{pv.icon_value}</span>;
    }

    // Priority 2: Fallback to legacy emoji/image_url from prompt_versions
    if (pv?.emoji?.trim()) {
      return <span>{pv.emoji}</span>;
    }
    if (pv?.image_url) {
      return (
        <img
          src={pv.image_url}
          alt=""
          className="h-4 w-4 rounded-sm object-cover"
        />
      );
    }

    // Priority 3: Check draft fields (same order)
    if (draft?.icon_type === 'image' && draft?.icon_value) {
      return (
        <img
          src={draft.icon_value}
          alt=""
          className="h-4 w-4 rounded-sm object-cover"
        />
      );
    }
    if (draft?.icon_type === 'emoji' && draft?.icon_value) {
      return <span>{draft.icon_value}</span>;
    }
    if (draft?.emoji?.trim()) {
      return <span>{draft.emoji}</span>;
    }
    if (draft?.image_url) {
      return (
        <img
          src={draft.image_url}
          alt=""
          className="h-4 w-4 rounded-sm object-cover"
        />
      );
    }

    // Default fallback
    return <span>💬</span>;
  };

  const handleRenameClick = (session: SessionListItemWithPrompt) => {
    setRenameTargetId(session.id);
    setRenameValue(session.title ?? getSessionTitle(session));
  };

  const handleRenameSave = () => {
    if (!renameTargetId) return;
    
    renameSession.mutate(
      { sessionId: renameTargetId, title: renameValue },
      {
        onSuccess: () => {
          setRenameTargetId(null);
          setRenameValue("");
        },
      }
    );
  };

  const handleRenameCancel = () => {
    setRenameTargetId(null);
    setRenameValue("");
  };

  const handleDeleteClick = (session: SessionListItemWithPrompt) => {
    setDeleteTargetSession(session);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTargetSession) return;

    const deletingId = deleteTargetSession.id;
    const isDeletingActive = deletingId === sessionId;

    // Pre-compute the "next" session for redirect, if any
    const nextSession = sessionList?.find((s) => s.id !== deletingId);

    deleteSession.mutate(
      { sessionId: deletingId },
      {
        onSuccess: () => {
          setDeleteTargetSession(null);

          // Handle redirect if we deleted the active session
          if (isDeletingActive) {
            if (nextSession) {
              // Go to another session of the same prompt version
              navigate(`/chat/${nextSession.id}`);
            } else {
              // No more sessions: go back to home as safe fallback
              navigate("/");
            }
          }
        },
      }
    );
  };

  const handleDeleteCancel = () => {
    setDeleteTargetSession(null);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
      {/* New Prompt Button - only for Admin/Editor */}
      {(role === 'admin' || role === 'editor') && (
        <SidebarGroup>
          <div className="px-2 pt-2 pb-2">
            <Button
              className="w-full justify-center"
              size="default"
              onClick={() => createPrompt.mutate()}
              disabled={createPrompt.isPending}
            >
              <Plus className="h-4 w-4" />
              {open && (
                <span className="ml-1">
                  {createPrompt.isPending ? 'Creating...' : 'New Prompt'}
                </span>
              )}
            </Button>
          </div>
        </SidebarGroup>
      )}

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                // Filter nav items by role
                const shouldShow = 
                  item.url === "/" ? true : // Home - all roles
                  item.url === "/team" ? (role === 'admin' || role === 'editor') :
                  item.url === "/storage" ? role === 'admin' :
                  item.url === "/categories/edit" ? (role === 'admin' || role === 'editor') :
                  item.url === "/admin/api" ? role === 'admin' :
                  item.url === "/guide" ? true : // Guide - all roles (URL routing handled below)
                  false;

                if (!shouldShow) return null;

                // Route Guide item based on role
                let targetUrl = item.url;
                if (item.url === "/guide") {
                  targetUrl = (role === 'admin' || role === 'editor') ? "/guide" : "/guide-view";
                }
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={targetUrl}
                        end={item.url === "/"}
                        className="flex items-center gap-3"
                        activeClassName="bg-accent text-accent-foreground font-medium"
                      >
                        <item.icon className="h-4 w-4" />
                        {open && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sessions Group (always visible) */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel>
            {open ? "Sessions" : <MessageSquare className="h-4 w-4" />}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {sessionListLoading && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Loading...
              </div>
            )}

            {sessionListError && (
              <div className="px-3 py-2 text-sm text-destructive">
                Failed to load sessions
              </div>
            )}

            {!sessionListLoading && !sessionListError && sessionList.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No sessions yet
              </div>
            )}

            {!sessionListLoading && !sessionListError && sessionList.length > 0 && open && (
          <div
            className={cn(
              "mt-2 h-[calc(100vh-320px)] overflow-y-auto pr-1",
              // Firefox: thin scrollbar, hidden by default
              "[scrollbar-width:thin]",
              "[scrollbar-color:transparent_transparent]",
              // WebKit: hide scrollbar until hover
              "[&::-webkit-scrollbar]:w-1",
              "[&::-webkit-scrollbar-track]:bg-transparent",
              "[&::-webkit-scrollbar-thumb]:bg-transparent",
              "hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40",
              "hover:[&::-webkit-scrollbar-thumb]:rounded-full"
            )}
          >
            <SidebarMenu>
                  {sessionList.map((session) => {
                    const isActive = session.id === sessionId;
                    const relativeTime = formatDistanceToNow(new Date(session.created_at), { 
                      addSuffix: true 
                    });

                    return (
                      <SidebarMenuItem key={session.id}>
                        <div className="flex items-start gap-1 w-full group">
                          {/* Three-dot menu on the LEFT */}
                          {open && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  onClick={(e) => e.stopPropagation()}
                                  className={cn(
                                    "mt-1 shrink-0 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted transition-opacity",
                                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                    isActive && "opacity-100"
                                  )}
                                  aria-label="Session actions"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                <DropdownMenuItem onClick={() => handleRenameClick(session)}>
                                  <Edit2 className="h-4 w-4 mr-2" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteClick(session)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}

                          {/* Main session button on the RIGHT */}
                          <button
                            type="button"
                            onClick={() => navigate(`/chat/${session.id}`)}
                            className={cn(
                              "flex-1 flex items-start gap-2 rounded-md px-3 py-2.5 text-left text-sm transition-colors min-w-0",
                              "hover:bg-muted",
                              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                              isActive && "bg-accent/80 text-accent-foreground font-medium border border-border"
                            )}
                          >
                  <span className="flex h-6 w-6 items-center justify-center shrink-0 text-lg">
                    {renderSessionIcon(session)}
                  </span>
                            {open && (
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="truncate font-medium">{getSessionTitle(session)}</span>
                                <span className="text-xs text-muted-foreground">{relativeTime}</span>
                              </div>
                            )}
                          </button>
                        </div>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Rename Dialog */}
      <Dialog open={!!renameTargetId} onOpenChange={(open) => {
        if (!open) handleRenameCancel();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename session</DialogTitle>
            <DialogDescription>
              Give this chat session a more descriptive name.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="session-title">Session title</Label>
            <Input
              id="session-title"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="e.g. Campaign ideas for Brand X"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !renameSession.isPending) {
                  handleRenameSave();
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Leave it blank to reset to the default date-based name.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleRenameCancel}
              disabled={renameSession.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameSave}
              disabled={renameSession.isPending}
            >
              {renameSession.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTargetSession}
        onOpenChange={(open) => {
          if (!open) handleDeleteCancel();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this chat and all of its messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteTargetSession && (
            <div className="mt-2 rounded-md bg-muted px-3 py-2 text-sm">
              <span className="font-medium">
                {getSessionTitle(deleteTargetSession)}
              </span>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleDeleteCancel}
              disabled={deleteSession.isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
              disabled={deleteSession.isPending}
            >
              {deleteSession.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}
