/**
 * Markdown toolbar utilities for text manipulation in textareas
 */

interface TextareaRef {
  value: string;
  selectionStart: number;
  selectionEnd: number;
  focus: () => void;
  setSelectionRange: (start: number, end: number) => void;
}

/**
 * Get the word boundaries at cursor position if no selection
 */
function getWordBoundaries(text: string, position: number): { start: number; end: number } {
  let start = position;
  let end = position;

  // Find word start
  while (start > 0 && /\S/.test(text[start - 1])) {
    start--;
  }

  // Find word end
  while (end < text.length && /\S/.test(text[end])) {
    end++;
  }

  return { start, end };
}

/**
 * Wrap selected text or word at cursor with prefix and suffix
 * If text is already wrapped, unwrap it (toggle)
 */
export function wrapSelection(
  textarea: HTMLTextAreaElement | null,
  prefix: string,
  suffix?: string
): string {
  if (!textarea) return '';

  const actualSuffix = suffix ?? prefix;
  const text = textarea.value;
  let start = textarea.selectionStart;
  let end = textarea.selectionEnd;

  // If no selection, select word at cursor
  if (start === end) {
    const boundaries = getWordBoundaries(text, start);
    start = boundaries.start;
    end = boundaries.end;
  }

  const selectedText = text.substring(start, end);
  const before = text.substring(0, start);
  const after = text.substring(end);

  // Check if already wrapped (toggle off)
  const isWrapped = 
    before.endsWith(prefix) && 
    after.startsWith(actualSuffix);

  let newText: string;
  let newCursorPos: number;

  if (isWrapped) {
    // Remove wrapping
    newText = 
      before.substring(0, before.length - prefix.length) +
      selectedText +
      after.substring(actualSuffix.length);
    newCursorPos = start - prefix.length;
  } else {
    // Add wrapping
    const wrappedText = selectedText || 'text';
    newText = before + prefix + wrappedText + actualSuffix + after;
    newCursorPos = start + prefix.length;
  }

  // Update textarea
  textarea.value = newText;
  textarea.focus();
  
  // Set cursor position
  if (isWrapped) {
    textarea.setSelectionRange(newCursorPos, newCursorPos + selectedText.length);
  } else {
    textarea.setSelectionRange(
      newCursorPos, 
      newCursorPos + (selectedText || 'text').length
    );
  }

  return newText;
}

/**
 * Insert text at cursor position
 */
export function insertAtCursor(
  textarea: HTMLTextAreaElement | null,
  text: string
): string {
  if (!textarea) return '';

  const value = textarea.value;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  const newText = value.substring(0, start) + text + value.substring(end);
  
  textarea.value = newText;
  textarea.focus();
  
  const newCursorPos = start + text.length;
  textarea.setSelectionRange(newCursorPos, newCursorPos);

  return newText;
}

/**
 * Insert or remove header prefix at current line
 * @param level 0 = paragraph (remove #), 1-3 = header level
 */
export function insertHeader(
  textarea: HTMLTextAreaElement | null,
  level: 0 | 1 | 2 | 3
): string {
  if (!textarea) return '';

  const text = textarea.value;
  const cursorPos = textarea.selectionStart;

  // Find start of current line
  let lineStart = cursorPos;
  while (lineStart > 0 && text[lineStart - 1] !== '\n') {
    lineStart--;
  }

  // Find end of current line
  let lineEnd = cursorPos;
  while (lineEnd < text.length && text[lineEnd] !== '\n') {
    lineEnd++;
  }

  const currentLine = text.substring(lineStart, lineEnd);
  const before = text.substring(0, lineStart);
  const after = text.substring(lineEnd);

  // Strip existing header markers
  const strippedLine = currentLine.replace(/^#{1,6}\s*/, '');

  let newLine: string;
  if (level === 0) {
    // Paragraph: just stripped line
    newLine = strippedLine;
  } else {
    // Add header prefix
    const prefix = '#'.repeat(level) + ' ';
    newLine = prefix + strippedLine;
  }

  const newText = before + newLine + after;
  textarea.value = newText;
  textarea.focus();

  // Position cursor at end of line
  const newCursorPos = lineStart + newLine.length;
  textarea.setSelectionRange(newCursorPos, newCursorPos);

  return newText;
}

/**
 * Insert a code block at cursor
 */
export function insertCodeBlock(textarea: HTMLTextAreaElement | null): string {
  if (!textarea) return '';

  const codeBlock = '\n```\ncode\n```\n';
  return insertAtCursor(textarea, codeBlock);
}

/**
 * Insert a markdown link at cursor or around selection
 */
export function insertLink(textarea: HTMLTextAreaElement | null): string {
  if (!textarea) return '';

  const text = textarea.value;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  const selectedText = text.substring(start, end);
  const linkText = selectedText || 'text';
  const linkMarkdown = `[${linkText}](https://example.com)`;

  const before = text.substring(0, start);
  const after = text.substring(end);

  const newText = before + linkMarkdown + after;
  
  textarea.value = newText;
  textarea.focus();

  // Select the URL part so user can replace it
  const urlStart = start + linkText.length + 3; // after "[text]("
  const urlEnd = urlStart + 'https://example.com'.length;
  textarea.setSelectionRange(urlStart, urlEnd);

  return newText;
}

/**
 * Insert image markdown with URL
 */
export function insertImage(
  textarea: HTMLTextAreaElement | null,
  url: string
): string {
  if (!textarea) return '';

  const imageMarkdown = `![image](${url})`;
  return insertAtCursor(textarea, imageMarkdown);
}
