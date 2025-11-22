import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

export function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        // Remove top margin from first element, bottom from last
        "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        // Ensure links are styled properly
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        // Code blocks
        "prose-pre:bg-muted prose-pre:border prose-pre:border-border",
        "prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
        className
      )}
    >
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Prevent HTML rendering (security)
          html: () => null,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
