import { Edit2, MoreVertical, UserX, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { TableCell, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { RoleBadge } from './RoleBadge';
import type { TeamMember, AppRole } from '@/hooks/useTeam';

interface TeamMemberRowProps {
  member: TeamMember;
  currentRole: AppRole;
  onEdit: (member: TeamMember) => void;
  onDeactivate: (member: TeamMember) => void;
  onReactivate: (member: TeamMember) => void;
}

export function TeamMemberRow({ member, currentRole, onEdit, onDeactivate, onReactivate }: TeamMemberRowProps) {
  const canManage =
    currentRole === 'admin' ||
    (currentRole === 'editor' && member.role === 'user');

  const getInitials = (name: string | null, email: string | null) => {
    if (name && name.trim().length > 0) {
      return name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }

    if (email && email.length > 0) {
      return email[0].toUpperCase();
    }

    return '?';
  };

  const formatLastSignIn = (date: string | null) => {
    if (!date) return 'Never';
    try {
      return format(new Date(date), 'MMM d, yyyy HH:mm');
    } catch {
      return 'Never';
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {member.avatar_url && <AvatarImage src={member.avatar_url} alt={member.full_name || member.email} />}
            <AvatarFallback>{getInitials(member.full_name, member.email)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">
              {member.full_name || '(no name)'}
            </p>
            <p className="text-sm text-muted-foreground">{member.email}</p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <RoleBadge role={member.role} />
      </TableCell>

      <TableCell>
        {member.banned ? (
          <Badge variant="destructive">Deactivated</Badge>
        ) : (
          <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
            Active
          </Badge>
        )}
      </TableCell>

      <TableCell className="text-muted-foreground text-sm">
        {formatLastSignIn(member.last_sign_in_at)}
      </TableCell>

      <TableCell>
        <TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canManage ? (
                <>
                  <DropdownMenuItem onClick={() => onEdit(member)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  {!member.banned ? (
                    <DropdownMenuItem
                      onClick={() => onDeactivate(member)}
                      className="text-destructive focus:text-destructive"
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Deactivate
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onReactivate(member)}>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Reactivate
                    </DropdownMenuItem>
                  )}
                </>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <DropdownMenuItem disabled>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {!member.banned ? (
                        <DropdownMenuItem disabled className="text-destructive">
                          <UserX className="h-4 w-4 mr-2" />
                          Deactivate
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem disabled>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Reactivate
                        </DropdownMenuItem>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Editors can only manage Users</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipProvider>
      </TableCell>
    </TableRow>
  );
}
