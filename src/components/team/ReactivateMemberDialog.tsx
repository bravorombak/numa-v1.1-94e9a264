import { useReactivateTeamMember, type TeamMember } from '@/hooks/useTeam';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RoleBadge } from './RoleBadge';

interface ReactivateMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
}

export function ReactivateMemberDialog({ open, onOpenChange, member }: ReactivateMemberDialogProps) {
  const reactivateMember = useReactivateTeamMember();

  const handleReactivate = async () => {
    if (!member) return;

    try {
      await reactivateMember.mutateAsync({ user_id: member.id });
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the hook's toast
      console.error('Failed to reactivate member:', error);
    }
  };

  if (!member) return null;

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Reactivate {member.full_name || member.email}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            They will be able to log in again. Their previous data and history will remain intact.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-md bg-muted p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {member.avatar_url && (
                <AvatarImage src={member.avatar_url} alt={member.full_name || member.email} />
              )}
              <AvatarFallback>{getInitials(member.full_name, member.email)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {member.full_name || '(no name)'}
              </p>
              <p className="text-sm text-muted-foreground">{member.email}</p>
            </div>
            <RoleBadge role={member.role} />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={reactivateMember.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReactivate}
            disabled={reactivateMember.isPending}
          >
            {reactivateMember.isPending ? 'Reactivating...' : 'Reactivate'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
