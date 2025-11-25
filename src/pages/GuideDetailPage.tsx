import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuideTree } from "@/components/guide/GuideTree";
import { GuideEditor } from "@/components/guide/GuideEditor";
import { CreateGuideDialog } from "@/components/guide/CreateGuideDialog";
import { useGuidePage, useGuideTree } from "@/hooks/useGuide";
import { useAuthStore } from "@/stores/authStore";
import { buildTreeFromFlat } from "@/lib/guideUtils";

const GuideDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const role = profile?.role || 'user';
  const [showCreateDialog, setShowCreateDialog] = useState(false);

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
            New
          </Button>
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

      {/* Right Panel - Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {pageLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-muted-foreground">Loading page...</div>
          </div>
        ) : page ? (
          <GuideEditor page={page} allPages={pages || []} />
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
