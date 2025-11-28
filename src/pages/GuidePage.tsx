import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuideTree } from "@/components/guide/GuideTree";
import { CreateGuideDialog } from "@/components/guide/CreateGuideDialog";
import { useGuideTree } from "@/hooks/useGuide";
import { useAuthStore } from "@/stores/authStore";
import { buildTreeFromFlat } from "@/lib/guideUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const GuidePage = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const role = profile?.role || 'user';
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const { data: pages, isLoading, error } = useGuideTree();

  const canEdit = role === 'admin' || role === 'editor';

  if (!canEdit) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="text-center">
          <h1 className="text-2xl font-header font-extrabold text-foreground mb-2">
            Access Required
          </h1>
          <p className="text-muted-foreground">
            Only Admins and Editors can manage the guide.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="text-center">
          <h1 className="text-2xl font-header font-extrabold text-foreground mb-2">Error</h1>
          <p className="text-muted-foreground">Failed to load guide pages.</p>
        </div>
      </div>
    );
  }

  const tree = pages ? buildTreeFromFlat(pages) : [];

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Left Sidebar - Tree Navigation */}
      <div className={cn(
        "border-r flex flex-col bg-background z-40 transition-transform duration-200",
        "w-80",
        "fixed inset-y-0 left-0 md:relative md:translate-x-0",
        isMobile && !sidebarOpen && "-translate-x-full"
      )}>
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <h2 className="font-header font-extrabold">Guide Pages</h2>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              New Page
            </Button>
            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading pages...</div>
          ) : tree.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 px-6 py-10 text-center">
              <div className="text-3xl">📚</div>
              <h2 className="text-sm font-medium">Belum ada halaman panduan.</h2>
              <p className="text-xs text-muted-foreground max-w-sm">
                Buat halaman pertama untuk memulai dokumentasi tim.
              </p>
            </div>
          ) : (
            <GuideTree
              items={tree}
              onPageClick={(id) => navigate(`/guide/${id}`)}
            />
          )}
        </div>
      </div>

      {/* Backdrop on mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="absolute inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col px-4 py-4 sm:px-6 sm:py-6 max-w-full overflow-x-hidden">
        {/* Mobile header (only shows when sidebar is closed) */}
        {isMobile && (
          <div className="border-b pb-4 mb-4 md:hidden">
            <Button variant="outline" size="sm" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-4 w-4 mr-2" />
              Pages
            </Button>
          </div>
        )}
        
        <div className="flex-1 flex items-center justify-center bg-muted/10">
          <div className="text-center max-w-md px-6">
            <h2 className="text-2xl font-header font-extrabold mb-2">Guide Editor</h2>
            <p className="text-muted-foreground mb-6">
              Select a page from the sidebar to edit, or create a new one to get started.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Page
            </Button>
          </div>
        </div>
      </div>

      <CreateGuideDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        pages={pages || []}
      />
    </div>
  );
};

export default GuidePage;
