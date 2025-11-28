import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CategoryBadge } from '@/components/categories/CategoryBadge';
import { Settings } from 'lucide-react';

interface PromptCardProps {
  id: string;
  title: string;
  description: string | null;
  emoji: string | null;
  icon_type: 'emoji' | 'image' | null;
  icon_value: string | null;
  category: {
    id: string;
    name: string;
    bg_color: string;
    text_color: string;
    border_color: string;
  } | null;
  version_number: number;
  prompt_draft_id: string;
  showEditButton?: boolean;
}

export const PromptCard = ({
  id,
  title,
  description,
  emoji,
  icon_type,
  icon_value,
  category,
  version_number,
  prompt_draft_id,
  showEditButton = true,
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
      className="group relative flex h-full cursor-pointer flex-col transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
      onClick={handleClick}
    >
      <CardHeader className="space-y-3 pb-4">
        {/* Line 1: Icon + Title */}
        <div className="flex items-center gap-2">
          {icon_type === 'image' && icon_value ? (
            <img 
              src={icon_value} 
              alt="Prompt icon" 
              className="h-8 w-8 rounded object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : icon_type === 'emoji' && icon_value ? (
            <span className="text-2xl transition-transform duration-200 group-hover:scale-105">{icon_value}</span>
          ) : emoji ? (
            <span className="text-2xl transition-transform duration-200 group-hover:scale-105">{emoji}</span>
          ) : null}
          <h3 className="line-clamp-2 text-lg font-header font-extrabold leading-tight flex-1">
            {title}
          </h3>
        </div>

        {/* Line 2: Metadata row - Version + Category + Gear */}
        <div className="flex items-center gap-2">
          {typeof version_number === 'number' && (
            <Badge variant="outline" className="text-xs">
              v{version_number}
            </Badge>
          )}

          {category && (
            <CategoryBadge
              name={category.name}
              bg_color={category.bg_color}
              text_color={category.text_color}
              border_color={category.border_color}
            />
          )}

          {showEditButton && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleEditClick}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {description || 'No description provided.'}
        </p>
      </CardContent>
    </Card>
  );
};
