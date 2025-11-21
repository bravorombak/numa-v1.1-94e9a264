import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ViewModeToggleProps {
  viewMode: 'card' | 'list';
  onViewModeChange: (mode: 'card' | 'list') => void;
}

export const ViewModeToggle = ({
  viewMode,
  onViewModeChange,
}: ViewModeToggleProps) => {
  return (
    <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-1">
      <Button
        variant={viewMode === 'card' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('card')}
        className="h-8 w-8 p-0"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('list')}
        className="h-8 w-8 p-0"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
};
