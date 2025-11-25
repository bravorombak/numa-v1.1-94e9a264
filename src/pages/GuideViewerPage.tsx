import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGuideTree, useGuidePage } from "@/hooks/useGuide";
import { GuideTree } from "@/components/guide/GuideTree";
import { GuideMarkdown } from "@/components/guide/GuideMarkdown";
import { buildTreeFromFlat } from "@/lib/guideUtils";
import type { GuideTreeItem } from "@/hooks/useGuide";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function getFirstPageId(tree: GuideTreeItem[]): string | null {
  if (tree.length === 0) return null;
  const first = tree[0];
  // If has children, go deeper; else return this page
  if (first.children && first.children.length > 0) {
    return getFirstPageId(first.children);
  }
  return first.id;
}

export default function GuideViewerPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const { data: pages, isLoading: treeLoading, error: treeError } = useGuideTree();
  const { data: page, isLoading: pageLoading, error: pageError } = useGuidePage(id);

  // Build tree structure
  const tree = pages ? buildTreeFromFlat(pages) : [];

  // Auto-redirect to first page if no id in URL
  useEffect(() => {
    if (!id && tree.length > 0 && !treeLoading) {
      const firstId = getFirstPageId(tree);
      if (firstId) {
        navigate(`/guide-view/${firstId}`, { replace: true });
      }
    }
  }, [id, tree, treeLoading, navigate]);

  const handlePageClick = (pageId: string) => {
    navigate(`/guide-view/${pageId}`);
  };

  // Show tree loading state
  if (treeLoading) {
    return (
      <div className="flex h-full">
        <div className="w-80 border-r flex flex-col">
          <div className="border-b px-4 py-3">
            <h2 className="font-semibold">Guide</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading pages...</p>
        </div>
      </div>
    );
  }

  // Show tree error
  if (treeError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-medium mb-2">Failed to load guide pages</p>
          <p className="text-sm text-muted-foreground mb-4">
            {treeError instanceof Error ? treeError.message : "Unknown error"}
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Empty state - no pages exist
  if (tree.length === 0) {
    return (
      <div className="flex h-full">
        <div className="w-80 border-r flex flex-col">
          <div className="border-b px-4 py-3">
            <h2 className="font-semibold">Guide</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-sm text-muted-foreground">No pages yet</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">
              No guide pages yet. Ask an admin to add content.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Sidebar - Tree Navigation */}
      <div className="w-80 border-r flex flex-col">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold">Guide</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <GuideTree
            items={tree}
            activePageId={id}
            onPageClick={handlePageClick}
          />
        </div>
      </div>

      {/* Right Panel - Content Viewer */}
      <div className="flex-1 overflow-y-auto">
        {pageLoading && (
          <div className="max-w-4xl mx-auto p-8">
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}

        {pageError && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-foreground font-medium mb-2">Page not found</p>
              <Button onClick={() => navigate("/guide-view")}>
                Back to Guide
              </Button>
            </div>
          </div>
        )}

        {!pageLoading && !pageError && page && (
          <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
            <GuideMarkdown content={page.content_md || "*No content yet.*"} />
          </div>
        )}
      </div>
    </div>
  );
}
