import { useDeactivateTeamMember, type TeamMember } from '@/hooks/useTeam';
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

interface DeactivateMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
}

export function DeactivateMemberDialog({ open, onOpenChange, member }: DeactivateMemberDialogProps) {
  const deactivateMember = useDeactivateTeamMember();

  const handleDeactivate = async () => {
    if (!member) return;

    try {
      await deactivateMember.mutateAsync({ user_id: member.id });
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the hook's toast
      console.error('Failed to deactivate member:', error);
    }
  };

  if (!member) return null;

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

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Deactivate {member.full_name || member.email}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            They will no longer be able to log in. Their data will be preserved.
            You can reactivate them later if needed.
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
          <AlertDialogCancel disabled={deactivateMember.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleDeactivate}
            disabled={deactivateMember.isPending}
          >
            {deactivateMember.isPending ? 'Deactivating...' : 'Deactivate'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
