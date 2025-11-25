import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { AppRole } from '@/hooks/useTeam';

interface RoleBadgeProps {
  role: AppRole;
  allRoles?: string[];
}

export function RoleBadge({ role, allRoles }: RoleBadgeProps) {
  const variant =
    role === 'admin' ? 'destructive' :
    role === 'editor' ? 'secondary' :
    'outline';

  const badge = (
    <Badge variant={variant} className="capitalize">
      {role}
    </Badge>
  );

  // Show tooltip with all roles if user has multiple roles
  if (allRoles && allRoles.length > 1) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">Roles: {allRoles.join(', ')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
}
