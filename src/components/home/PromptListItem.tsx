import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { TableCell, TableRow } from '@/components/ui/table';
import { CategoryBadge } from '@/components/categories/CategoryBadge';

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
  model: {
    id: string;
    name: string;
  } | null;
  published_at: string;
}

export const PromptListItem = ({
  id,
  title,
  emoji,
  category,
  model,
  published_at,
}: PromptListItemProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/prompts/${id}/run`);
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
        <span className="text-sm text-muted-foreground">
          {model?.name || '—'}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(published_at), { addSuffix: true })}
        </span>
      </TableCell>
    </TableRow>
  );
};
