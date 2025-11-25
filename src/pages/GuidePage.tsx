import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuideTree } from "@/components/guide/GuideTree";
import { CreateGuideDialog } from "@/components/guide/CreateGuideDialog";
import { useGuideTree } from "@/hooks/useGuide";
import { useAuthStore } from "@/stores/authStore";
import { buildTreeFromFlat } from "@/lib/guideUtils";

const GuidePage = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const role = profile?.role || 'user';
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: pages, isLoading, error } = useGuideTree();

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

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-foreground mb-2">Error</h1>
          <p className="text-muted-foreground">Failed to load guide pages.</p>
        </div>
      </div>
    );
  }

  const tree = pages ? buildTreeFromFlat(pages) : [];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar - Tree Navigation */}
      <div className="w-80 border-r flex flex-col">
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <h2 className="font-semibold">Guide Pages</h2>
          <Button
            size="sm"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Page
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading pages...</div>
          ) : tree.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                No pages yet. Create your first guide page to get started.
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

      {/* Right Panel - Empty State */}
      <div className="flex-1 flex items-center justify-center bg-muted/10">
        <div className="text-center max-w-md px-6">
          <h2 className="text-2xl font-semibold mb-2">Guide Editor</h2>
          <p className="text-muted-foreground mb-6">
            Select a page from the sidebar to edit, or create a new one to get started.
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Page
          </Button>
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
