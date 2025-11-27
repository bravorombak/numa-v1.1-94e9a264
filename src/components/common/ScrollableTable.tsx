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
    <div className={cn("relative", className)}>
      <div className="overflow-x-auto rounded-lg border bg-card">
        <div className={cn("w-full", minWidth)}>
          {children}
        </div>
      </div>
      {/* Right-edge gradient scroll indicator */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
