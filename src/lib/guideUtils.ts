import type { GuideTreeItem, GuidePage } from "@/hooks/useGuide";

/**
 * Transform flat array of pages into nested tree structure
 */
export function buildTreeFromFlat(pages: GuideTreeItem[]): GuideTreeItem[] {
  const pageMap = new Map<string, GuideTreeItem>();
  const rootPages: GuideTreeItem[] = [];

  // Create a map of all pages with children arrays
  pages.forEach(page => {
    pageMap.set(page.id, { ...page, children: [] });
  });

  // Build the tree structure
  pages.forEach(page => {
    const pageWithChildren = pageMap.get(page.id)!;
    
    if (page.parent_id === null) {
      rootPages.push(pageWithChildren);
    } else {
      const parent = pageMap.get(page.parent_id);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(pageWithChildren);
      } else {
        // Parent doesn't exist, treat as root
        rootPages.push(pageWithChildren);
      }
    }
  });

  // Sort children by sort_order at each level
  const sortChildren = (items: GuideTreeItem[]) => {
    items.sort((a, b) => a.sort_order - b.sort_order);
    items.forEach(item => {
      if (item.children && item.children.length > 0) {
        sortChildren(item.children);
      }
    });
  };

  sortChildren(rootPages);
  return rootPages;
}

/**
 * Generate URL-friendly slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Get breadcrumb path for a page
 */
export function getBreadcrumb(
  pageId: string,
  allPages: GuidePage[]
): string[] {
  const breadcrumb: string[] = [];
  let currentId: string | null = pageId;

  while (currentId) {
    const page = allPages.find(p => p.id === currentId);
    if (!page) break;
    
    breadcrumb.unshift(page.title);
    currentId = page.parent_id;
  }

  return breadcrumb;
}
