import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface GuideMarkdownProps {
  content: string;
  className?: string;
}

export function GuideMarkdown({ content, className }: GuideMarkdownProps) {
  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none guide-markdown",
        // Brand color overrides
        "prose-headings:text-foreground",
        "prose-p:text-muted-foreground",
        "prose-strong:text-foreground",
        "prose-li:text-muted-foreground",
        "prose-ul:text-muted-foreground",
        "prose-ol:text-muted-foreground",
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
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            return !inline && language ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={language}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                }}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
