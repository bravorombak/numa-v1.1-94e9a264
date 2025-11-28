import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PromptSyntaxHighlighterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const VARIABLE_REGEX = /\{\{\s*[\w\d_-]+\s*\}\}/g;
const HEADER_REGEX = /^(#{1,3}\s.*)$/gm;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function highlightText(text: string): string {
  let escaped = escapeHtml(text);

  // Variables {{VAR}}
  escaped = escaped.replace(VARIABLE_REGEX, (match) =>
    `<mark class="prompt-hl">${match}</mark>`
  );

  // Headers #, ##, ###
  escaped = escaped.replace(HEADER_REGEX, (match) =>
    `<mark class="prompt-hl">${match}</mark>`
  );

  // Add a trailing space to prevent the last line from collapsing
  return escaped + ' ';
}

export const PromptSyntaxHighlighter: React.FC<PromptSyntaxHighlighterProps> = ({
  value,
  onChange,
  placeholder,
  className,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLPreElement>(null);

  const handleScroll = () => {
    if (backdropRef.current && textareaRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('scroll', handleScroll);
      return () => textarea.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const highlightedHtml = highlightText(value);

  return (
    <div className={cn('relative', className)}>
      {/* Backdrop with highlighted text */}
      <pre
        ref={backdropRef}
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0',
          'whitespace-pre-wrap break-words overflow-hidden',
          'font-mono text-sm px-3 py-2',
          'text-muted-foreground'
        )}
      >
        <code
          className="block"
          dangerouslySetInnerHTML={{ __html: highlightedHtml || '&nbsp;' }}
        />
      </pre>

      {/* Actual textarea for editing */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onScroll={handleScroll}
        placeholder={placeholder}
        spellCheck={false}
        className={cn(
          'relative z-10 w-full h-full bg-transparent text-sm font-mono px-3 py-2',
          'border-0 shadow-none outline-none',
          'focus-visible:ring-0 focus-visible:ring-offset-0',
          'resize-none',
          'text-transparent caret-[hsl(var(--foreground))]',
          'selection:bg-primary/20',
          'placeholder:text-muted-foreground'
        )}
      />
    </div>
  );
};
