import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TeamMemberRow } from './TeamMemberRow';
import type { TeamMember, AppRole } from '@/hooks/useTeam';

interface TeamMemberTableProps {
  members: TeamMember[];
  currentRole: AppRole;
  onEdit: (member: TeamMember) => void;
  onDeactivate: (member: TeamMember) => void;
  onReactivate: (member: TeamMember) => void;
}

export function TeamMemberTable({ members, currentRole, onEdit, onDeactivate, onReactivate }: TeamMemberTableProps) {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead className="hidden md:table-cell">Role</TableHead>
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead className="hidden md:table-cell">Last Sign In</TableHead>
            <TableHead className="hidden md:table-cell text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TeamMemberRow
              key={member.id}
              member={member}
              currentRole={currentRole}
              onEdit={onEdit}
              onDeactivate={onDeactivate}
              onReactivate={onReactivate}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
