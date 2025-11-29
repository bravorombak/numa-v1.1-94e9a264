import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateTeamMember, type TeamMember, type AppRole } from '@/hooks/useTeam';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const editMemberSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  role: z.enum(['admin', 'editor', 'user']),
});

type EditMemberFormData = z.infer<typeof editMemberSchema>;

interface EditMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
  currentRole: AppRole;
}

export function EditMemberDialog({ open, onOpenChange, member, currentRole }: EditMemberDialogProps) {
  const updateMember = useUpdateTeamMember();

  const form = useForm<EditMemberFormData>({
    resolver: zodResolver(editMemberSchema),
    defaultValues: {
      full_name: '',
      role: 'user',
    },
  });

  // Reset form when member changes or dialog opens
  useEffect(() => {
    if (member && open) {
      form.reset({
        full_name: member.full_name || '',
        role: member.resolved_role,
      });
    }
  }, [member, open, form]);

  const onSubmit = async (data: EditMemberFormData) => {
    if (!member) return;

    try {
      // Build updates object with only changed fields
      const updates: Partial<EditMemberFormData> = {};
      
      if (data.full_name !== member.full_name) {
        updates.full_name = data.full_name;
      }
      if (data.role !== member.resolved_role) {
        updates.role = data.role;
      }

      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        await updateMember.mutateAsync({
          user_id: member.id,
          updates,
        });
      }

      onOpenChange(false);
    } catch (error) {
      // Error is handled by the hook's toast
      console.error('Failed to update member:', error);
    }
  };

  // Role options based on current user's role
  const roleOptions = currentRole === 'admin'
    ? [
        { value: 'admin', label: 'Admin' },
        { value: 'editor', label: 'Editor' },
        { value: 'user', label: 'User' },
      ]
    : [{ value: 'user', label: 'User' }];

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
          <DialogDescription>
            Update team member information and role.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Input value={member.email} disabled className="bg-muted" />
            </FormItem>

            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateMember.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMember.isPending}>
                {updateMember.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
