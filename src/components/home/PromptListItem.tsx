import { useNavigate } from 'react-router-dom';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CategoryBadge } from '@/components/categories/CategoryBadge';
import { Settings } from 'lucide-react';

interface PromptListItemProps {
  id: string;
  title: string;
  emoji: string | null;
  category: {
    id: string;
    name: string;
    bg_color: string;
    text_color: string;
    border_color: string;
  } | null;
  version_number: number;
  prompt_draft_id: string;
}

export const PromptListItem = ({
  id,
  title,
  emoji,
  category,
  version_number,
  prompt_draft_id,
}: PromptListItemProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/prompts/${id}/run`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/prompts/${prompt_draft_id}/edit`);
  };

  return (
    <TableRow
      className="cursor-pointer transition-colors hover:bg-muted/50"
      onClick={handleClick}
    >
      <TableCell>
        <div className="flex items-center gap-2">
          {emoji && <span className="text-lg">{emoji}</span>}
          <span className="font-medium">{title}</span>
        </div>
      </TableCell>
      <TableCell>
        {category ? (
          <CategoryBadge
            name={category.name}
            bg_color={category.bg_color}
            text_color={category.text_color}
            border_color={category.border_color}
          />
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="text-xs px-2 py-0.5">
          v{version_number}
        </Badge>
      </TableCell>
      <TableCell>
        <button
          onClick={handleEditClick}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label="Edit prompt"
        >
          <Settings className="h-4 w-4" />
        </button>
      </TableCell>
    </TableRow>
  );
};
