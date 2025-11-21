import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CategoryBadge } from '@/components/categories/CategoryBadge';
import { ArrowRight } from 'lucide-react';

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
  model: {
    id: string;
    name: string;
  } | null;
  published_at: string;
}

export const PromptCard = ({
  id,
  title,
  description,
  emoji,
  category,
  model,
  published_at,
}: PromptCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/prompts/${id}/run`);
  };

  return (
    <Card
      className="flex h-full cursor-pointer flex-col transition-shadow hover:shadow-md"
      onClick={handleClick}
    >
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {emoji && <span className="text-2xl">{emoji}</span>}
            <h3 className="line-clamp-2 text-lg font-semibold leading-tight">
              {title}
            </h3>
          </div>
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

      <CardFooter className="flex items-center justify-between border-t pt-4">
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          {model && <span className="font-medium">{model.name}</span>}
          <span>
            {formatDistanceToNow(new Date(published_at), { addSuffix: true })}
          </span>
        </div>
        <Button size="sm" variant="ghost">
          Open
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
};
