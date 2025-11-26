import { cn } from "@/lib/utils";

interface ScrollableTableProps {
  children: React.ReactNode;
  minWidth?: string;
  className?: string;
}

/**
 * A simple wrapper for tables that need horizontal scrolling on mobile devices.
 * Adds a subtle shadow to indicate scrollable content.
 */
export function ScrollableTable({ children, minWidth = "min-w-[600px]", className }: ScrollableTableProps) {
  return (
    <div className={cn("rounded-lg border overflow-x-auto", className)}>
      <div className={minWidth}>
        {children}
      </div>
    </div>
  );
}
