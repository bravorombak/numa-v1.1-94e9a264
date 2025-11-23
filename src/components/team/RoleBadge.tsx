import { Badge } from '@/components/ui/badge';
import type { AppRole } from '@/hooks/useTeam';

interface RoleBadgeProps {
  role: AppRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const variant =
    role === 'admin' ? 'destructive' :
    role === 'editor' ? 'secondary' :
    'outline';

  return (
    <Badge variant={variant} className="capitalize">
      {role}
    </Badge>
  );
}
