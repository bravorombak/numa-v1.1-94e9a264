import { CATEGORY_COLOR_PALETTE, type CategoryColorPreset } from '@/lib/categoryColors';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorSwatchSelectorProps {
  selectedPresetId: string | null;
  onSelect: (preset: CategoryColorPreset) => void;
  error?: string;
}

export const ColorSwatchSelector = ({
  selectedPresetId,
  onSelect,
  error,
}: ColorSwatchSelectorProps) => {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-6 gap-3">
        {CATEGORY_COLOR_PALETTE.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset)}
              className={cn(
                'relative flex h-12 w-full items-center justify-center rounded-lg transition-all',
                'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                isSelected && 'ring-2 ring-ring ring-offset-2'
              )}
              style={{
                backgroundColor: preset.bg_color,
                border: `2px solid ${preset.border_color}`,
              }}
              title={preset.label}
            >
              {isSelected && (
                <Check
                  className="h-5 w-5"
                  style={{ color: preset.text_color }}
                />
              )}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
};
