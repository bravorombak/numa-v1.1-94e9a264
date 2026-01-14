import { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Smile, X, Clock } from 'lucide-react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useTheme } from 'next-themes';
import { 
  searchEmojisWithAliases, 
  getRecentEmojis, 
  addRecentEmoji 
} from '@/lib/emojiAliases';

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { resolvedTheme } = useTheme();
  
  const debouncedSearch = useDebounce(search, 200);
  
  // Get recent emojis
  const [recents, setRecents] = useState<string[]>([]);
  
  useEffect(() => {
    if (open) {
      setRecents(getRecentEmojis());
    }
  }, [open]);
  
  // Search results from alias map
  const aliasResults = useMemo(() => {
    if (!debouncedSearch) return [];
    return searchEmojisWithAliases(debouncedSearch);
  }, [debouncedSearch]);
  
  const handleSelect = useCallback((emoji: string) => {
    onChange(emoji);
    addRecentEmoji(emoji);
    setOpen(false);
    setSearch('');
  }, [onChange]);
  
  // Handle emoji-mart selection
  const handleEmojiMartSelect = useCallback((emojiData: any) => {
    const emoji = emojiData.native;
    handleSelect(emoji);
  }, [handleSelect]);

  const handleRemove = useCallback(() => {
    onChange('');
    setOpen(false);
  }, [onChange]);
  
  // Determine if we should show custom search results
  const hasAliasResults = aliasResults.length > 0;
  const showAliasPanel = debouncedSearch && hasAliasResults;
  
  // Theme for emoji-mart
  const pickerTheme = resolvedTheme === 'dark' ? 'dark' : 'light';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-20 w-20 text-4xl p-0 flex items-center justify-center"
          type="button"
        >
          {value || <Smile className="h-8 w-8 text-muted-foreground" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[352px] p-0" 
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <div className="flex flex-col">
          {/* Custom search input for alias matching */}
          <div className="p-3 border-b">
            <Input
              placeholder="Search emojis (try: happy, sedih, fire, uang...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9"
              autoFocus
            />
          </div>
          
          {/* Alias search results panel */}
          {showAliasPanel && (
            <div className="border-b">
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground flex items-center gap-1">
                <span>Matches for "{debouncedSearch}"</span>
                <span className="text-muted-foreground/60">({aliasResults.length})</span>
              </div>
              <ScrollArea className="max-h-32">
                <div className="px-3 pb-3">
                  <div className="grid grid-cols-8 gap-1">
                    {aliasResults.slice(0, 40).map((emoji, idx) => (
                      <button
                        key={`alias-${idx}`}
                        type="button"
                        onClick={() => handleSelect(emoji)}
                        className="text-2xl hover:bg-accent hover:scale-110 rounded p-1 transition-all duration-150 flex items-center justify-center"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
          
          {/* Recents section (only show when not searching) */}
          {!debouncedSearch && recents.length > 0 && (
            <div className="border-b">
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Recent</span>
              </div>
              <div className="px-3 pb-3">
                <div className="grid grid-cols-8 gap-1">
                  {recents.slice(0, 16).map((emoji, idx) => (
                    <button
                      key={`recent-${idx}`}
                      type="button"
                      onClick={() => handleSelect(emoji)}
                      className="text-2xl hover:bg-accent hover:scale-110 rounded p-1 transition-all duration-150 flex items-center justify-center"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* emoji-mart Picker - always show for full browsing */}
          <div className="emoji-mart-wrapper">
            <Picker
              data={data}
              onEmojiSelect={handleEmojiMartSelect}
              theme={pickerTheme}
              previewPosition="none"
              skinTonePosition="none"
              searchPosition="none"
              maxFrequentRows={0}
              navPosition="bottom"
              perLine={8}
              emojiSize={28}
              emojiButtonSize={36}
              categories={[
                'people',
                'nature',
                'foods',
                'activity',
                'places',
                'objects',
                'symbols',
                'flags',
              ]}
            />
          </div>
          
          {/* Remove emoji button */}
          {value && (
            <div className="p-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="w-full"
                type="button"
              >
                <X className="h-4 w-4 mr-2" />
                Remove emoji
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
