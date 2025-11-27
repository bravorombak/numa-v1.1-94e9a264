import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuideTree } from "@/components/guide/GuideTree";
import { GuideEditor } from "@/components/guide/GuideEditor";
import { CreateGuideDialog } from "@/components/guide/CreateGuideDialog";
import { useGuidePage, useGuideTree } from "@/hooks/useGuide";
import { useAuthStore } from "@/stores/authStore";
import { buildTreeFromFlat } from "@/lib/guideUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const GuideDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const role = profile?.role || 'user';
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const { data: page, isLoading: pageLoading, error: pageError } = useGuidePage(id);
  const { data: pages, isLoading: treeLoading } = useGuideTree();

  const canEdit = role === 'admin' || role === 'editor';

  if (!canEdit) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-foreground mb-2">
            Access Required
          </h1>
          <p className="text-muted-foreground">
            Only Admins and Editors can manage the guide.
          </p>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-foreground mb-2">Page Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The guide page you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/guide")}>Back to Guide</Button>
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
          <h2 className="font-semibold">Guide Pages</h2>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              New
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
          {treeLoading ? (
            <div className="text-sm text-muted-foreground">Loading pages...</div>
          ) : (
            <GuideTree
              items={tree}
              activePageId={id}
              onPageClick={(pageId) => navigate(`/guide/${pageId}`)}
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

      {/* Right Panel - Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile toggle header */}
        {isMobile && (
          <div className="border-b px-4 py-2 md:hidden">
            <Button variant="outline" size="sm" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-4 w-4 mr-2" />
              Pages
            </Button>
          </div>
        )}
        
        {pageLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-muted-foreground">Loading page...</div>
          </div>
        ) : page ? (
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 max-w-full overflow-x-hidden">
            <GuideEditor page={page} allPages={pages || []} />
          </div>
        ) : null}
      </div>

      <CreateGuideDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        pages={pages || []}
      />
    </div>
  );
};

export default GuideDetailPage;
