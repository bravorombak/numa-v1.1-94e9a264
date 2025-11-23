import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TeamListFilters } from '@/hooks/useTeam';

interface TeamFiltersProps {
  filters: TeamListFilters;
  onChange: (next: TeamListFilters) => void;
}

export function TeamFilters({ filters, onChange }: TeamFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value, page: 1 });
  };

  const handleRoleChange = (value: string) => {
    onChange({ ...filters, role: value as TeamListFilters['role'], page: 1 });
  };

  const handleStatusChange = (value: string) => {
    onChange({ ...filters, status: value as TeamListFilters['status'], page: 1 });
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={filters.search}
          onChange={handleSearchChange}
          className="pl-9"
        />
      </div>

      <Select value={filters.role} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="editor">Editor</SelectItem>
          <SelectItem value="user">User</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.status ?? 'all'} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="deactivated">Deactivated</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
