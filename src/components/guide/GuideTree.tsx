import { FileText, Folder, FolderOpen } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { GuideTreeItem } from "@/hooks/useGuide";
import { Badge } from "@/components/ui/badge";

interface GuideTreeProps {
  items: GuideTreeItem[];
  activePageId?: string;
  onPageClick: (pageId: string) => void;
}

export function GuideTree({ items, activePageId, onPageClick }: GuideTreeProps) {
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <TreeNode
          key={item.id}
          item={item}
          activePageId={activePageId}
          onPageClick={onPageClick}
        />
      ))}
    </div>
  );
}

interface TreeNodeProps {
  item: GuideTreeItem;
  activePageId?: string;
  onPageClick: (pageId: string) => void;
  level?: number;
}

function TreeNode({ item, activePageId, onPageClick, level = 0 }: TreeNodeProps) {
  const hasChildren = item.children && item.children.length > 0;
  const [isExpanded, setIsExpanded] = useState(true);
  const isActive = item.id === activePageId;

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) {
            setIsExpanded(!isExpanded);
          }
          onPageClick(item.id);
        }}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isActive && "bg-accent text-accent-foreground font-medium",
          !item.is_published && "text-muted-foreground"
        )}
        style={{ paddingLeft: `${level * 0.75 + 0.75}rem` }}
      >
        {hasChildren ? (
          isExpanded ? (
            <FolderOpen className="h-4 w-4 flex-shrink-0" />
          ) : (
            <Folder className="h-4 w-4 flex-shrink-0" />
          )
        ) : (
          <FileText className="h-4 w-4 flex-shrink-0" />
        )}
        <span className="flex-1 text-left truncate">{item.title}</span>
        {!item.is_published && (
          <Badge variant="outline" className="ml-auto text-xs">
            Draft
          </Badge>
        )}
      </button>

      {hasChildren && isExpanded && (
        <div>
          {item.children!.map((child) => (
            <TreeNode
              key={child.id}
              item={child}
              activePageId={activePageId}
              onPageClick={onPageClick}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
