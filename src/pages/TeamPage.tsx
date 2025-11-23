import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useTeamMembers, type TeamListFilters, type TeamMember, type AppRole } from '@/hooks/useTeam';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TeamFilters } from '@/components/team/TeamFilters';
import { TeamMemberTable } from '@/components/team/TeamMemberTable';
import { TeamPagination } from '@/components/team/TeamPagination';
import { AddMemberDialog } from '@/components/team/AddMemberDialog';
import { EditMemberDialog } from '@/components/team/EditMemberDialog';
import { DeactivateMemberDialog } from '@/components/team/DeactivateMemberDialog';
import { ReactivateMemberDialog } from '@/components/team/ReactivateMemberDialog';
import { AlertCircle } from 'lucide-react';

const TeamPage = () => {
  const { profile } = useAuthStore();
  const role = profile?.role as AppRole | undefined;
  const isAdmin = role === 'admin';
  const isEditor = role === 'editor';
  const canAccessTeam = isAdmin || isEditor;

  const [filters, setFilters] = useState<TeamListFilters>({
    role: 'all',
    search: '',
    page: 1,
    limit: 20,
    status: 'all',
  });

  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);

  const { data, isLoading, isError } = useTeamMembers(filters, canAccessTeam);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / (filters.limit ?? 20))) : 1;

  const goToNextPage = () => {
    setFilters((prev) => ({
      ...prev,
      page: Math.min(prev.page + 1, totalPages),
    }));
  };

  const goToPrevPage = () => {
    setFilters((prev) => ({
      ...prev,
      page: Math.max(1, prev.page - 1),
    }));
  };

  const handleEdit = (member: TeamMember) => {
    setSelectedMember(member);
    setEditOpen(true);
  };

  const handleDeactivate = (member: TeamMember) => {
    setSelectedMember(member);
    setDeactivateOpen(true);
  };

  const handleReactivate = (member: TeamMember) => {
    setSelectedMember(member);
    setReactivateOpen(true);
  };

  // Access denied state
  if (!canAccessTeam) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="text-center space-y-3 max-w-md">
          <h2 className="text-2xl font-semibold text-foreground">
            No access to Team Management
          </h2>
          <p className="text-muted-foreground">
            Only Admin and Editor roles can manage team members.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage team members and their roles
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      {/* Filters */}
      <TeamFilters filters={filters} onChange={setFilters} />

      {/* Content States */}
      {isLoading && (
        <div className="rounded-lg border">
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load team members. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !isError && data?.users.length === 0 && (
        <div className="rounded-lg border border-dashed py-12 text-center">
          <p className="text-muted-foreground">No team members found.</p>
        </div>
      )}

      {!isLoading && !isError && data && data.users.length > 0 && (
        <>
          <TeamMemberTable
            members={data.users}
            currentRole={role!}
            onEdit={handleEdit}
            onDeactivate={handleDeactivate}
            onReactivate={handleReactivate}
          />
          
          <TeamPagination
            page={filters.page}
            totalPages={totalPages}
            onPrevious={goToPrevPage}
            onNext={goToNextPage}
          />
        </>
      )}

      {/* Dialogs */}
      <AddMemberDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        currentRole={role!}
      />
      <EditMemberDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        member={selectedMember}
        currentRole={role!}
      />
      <DeactivateMemberDialog
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        member={selectedMember}
      />
      <ReactivateMemberDialog
        open={reactivateOpen}
        onOpenChange={setReactivateOpen}
        member={selectedMember}
      />
    </div>
  );
};

export default TeamPage;
