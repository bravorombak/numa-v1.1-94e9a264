import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CategoryBadge } from '@/components/categories/CategoryBadge';
import { Settings } from 'lucide-react';

interface PromptCardProps {
  id: string;
  title: string;
  description: string | null;
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

export const PromptCard = ({
  id,
  title,
  description,
  emoji,
  category,
  version_number,
  prompt_draft_id,
}: PromptCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/prompts/${id}/run`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/prompts/${prompt_draft_id}/edit`);
  };

  return (
    <Card
      className="relative flex h-full cursor-pointer flex-col transition-shadow hover:shadow-md"
      onClick={handleClick}
    >
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            {emoji && <span className="text-2xl">{emoji}</span>}
            <h3 className="line-clamp-2 text-lg font-semibold leading-tight flex-1">
              {title}
            </h3>
            <Badge variant="secondary" className="text-xs px-2 py-0.5 ml-2">
              v{version_number}
            </Badge>
          </div>
          <button
            onClick={handleEditClick}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Edit prompt"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
        {category && (
          <CategoryBadge
            name={category.name}
            bg_color={category.bg_color}
            text_color={category.text_color}
            border_color={category.border_color}
          />
        )}
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {description || 'No description provided.'}
        </p>
      </CardContent>
    </Card>
  );
};
