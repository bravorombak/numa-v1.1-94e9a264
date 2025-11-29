import { useEffect, useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Lock } from 'lucide-react';

const editMemberSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  role: z.enum(['admin', 'editor', 'user']),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
})
.refine(
  (data) => {
    // If newPassword is provided, it must be at least 6 characters
    if (data.newPassword && data.newPassword.length > 0) {
      return data.newPassword.length >= 6;
    }
    return true;
  },
  {
    message: 'Password must be at least 6 characters',
    path: ['newPassword'],
  }
)
.refine(
  (data) => {
    // If newPassword is provided, confirmPassword must match
    if (data.newPassword && data.newPassword.length > 0) {
      return data.confirmPassword === data.newPassword;
    }
    return true;
  },
  {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  }
);

type EditMemberFormData = z.infer<typeof editMemberSchema>;

interface EditMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
  currentRole: AppRole;
}

export function EditMemberDialog({ open, onOpenChange, member, currentRole }: EditMemberDialogProps) {
  const updateMember = useUpdateTeamMember();
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const form = useForm<EditMemberFormData>({
    resolver: zodResolver(editMemberSchema),
    defaultValues: {
      full_name: '',
      role: 'user',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Reset form when member changes or dialog opens
  useEffect(() => {
    if (member && open) {
      form.reset({
        full_name: member.full_name || '',
        role: member.resolved_role,
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordFields(false);
    }
  }, [member, open, form]);

  const onSubmit = async (data: EditMemberFormData) => {
    if (!member) return;

    try {
      // Build updates object with only changed fields
      const updates: any = {};
      
      if (data.full_name !== member.full_name) {
        updates.full_name = data.full_name;
      }
      if (data.role !== member.resolved_role) {
        updates.role = data.role;
      }
      // Include password if provided
      if (data.newPassword && data.newPassword.trim().length > 0) {
        updates.password = data.newPassword;
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

            {/* Password Section */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>Current password: ******** (hidden for security)</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="change-password"
                  checked={showPasswordFields}
                  onCheckedChange={(checked) => {
                    setShowPasswordFields(!!checked);
                    if (!checked) {
                      form.setValue('newPassword', '');
                      form.setValue('confirmPassword', '');
                    }
                  }}
                />
                <label htmlFor="change-password" className="text-sm font-medium cursor-pointer">
                  Set a new password
                </label>
              </div>

              {showPasswordFields && (
                <div className="space-y-4 pt-2">
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

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
