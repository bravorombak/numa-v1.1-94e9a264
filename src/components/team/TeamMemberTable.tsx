import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TeamMemberRow } from './TeamMemberRow';
import type { TeamMember, AppRole } from '@/hooks/useTeam';

interface TeamMemberTableProps {
  members: TeamMember[];
  currentRole: AppRole;
  onEdit: (member: TeamMember) => void;
  onDeactivate: (member: TeamMember) => void;
}

export function TeamMemberTable({ members, currentRole, onEdit, onDeactivate }: TeamMemberTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Sign In</TableHead>
            <TableHead className="w-16"></TableHead>
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
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
