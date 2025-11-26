import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Smile, X } from 'lucide-react';

// Curated list of common emojis
const EMOJI_CATEGORIES = {
  'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳'],
  'Gestures': ['👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '🤌', '🤏', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐', '🖖', '👋', '🤙', '💪', '🙏'],
  'Objects': ['💼', '📁', '📂', '🗂', '📅', '📆', '🗒', '📝', '📊', '📈', '📉', '🔔', '📢', '📣', '📯', '💡', '🔦', '🏮', '📮', '🔍', '🔎', '🔐', '🔒', '🔓', '🔑', '🗝', '🔨', '🪛', '⚙️', '🔧'],
  'Nature': ['🌱', '🌿', '☘️', '🍀', '🎋', '🎍', '🌾', '🌵', '🌴', '🌳', '🌲', '🏔', '⛰', '🌋', '🗻', '🏕', '🏖', '🏜', '🏝', '🏞', '🌅', '🌄', '🌠', '🌌', '🌉', '🌁', '☀️', '🌤', '⛅', '🌥'],
  'Activities': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🎯', '🎮', '🎰', '🎲', '🧩', '♟', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼'],
};

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Flatten all emojis for search
  const allEmojis = Object.values(EMOJI_CATEGORIES).flat();
  const filteredEmojis = search
    ? allEmojis.filter((emoji) => emoji.includes(search))
    : allEmojis;

  const handleSelect = (emoji: string) => {
    onChange(emoji);
    setOpen(false);
    setSearch('');
  };

  const handleRemove = () => {
    onChange('');
    setOpen(false);
  };

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
      <PopoverContent className="w-80 p-0" align="start">
        <div className="flex flex-col">
          <div className="p-3 border-b">
            <Input
              placeholder="Search emojis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9"
            />
          </div>
          <ScrollArea className="h-64">
            <div className="p-3">
              {search ? (
                <div className="grid grid-cols-8 gap-2">
                  {filteredEmojis.map((emoji, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelect(emoji)}
                      className="text-2xl hover:bg-accent rounded p-1 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              ) : (
                Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
                  <div key={category} className="mb-4 last:mb-0">
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">
                      {category}
                    </h4>
                    <div className="grid grid-cols-8 gap-2">
                      {emojis.map((emoji, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelect(emoji)}
                          className="text-2xl hover:bg-accent rounded p-1 transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
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
