import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categoryFormSchema, type CategoryFormData } from '@/lib/categoryValidation';
import { CategoryBadge } from './CategoryBadge';
import { ColorSwatchSelector } from './ColorSwatchSelector';
import {
  CATEGORY_COLOR_PALETTE,
  findPresetByColors,
  getDefaultPreset,
} from '@/lib/categoryColors';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateCategory, useUpdateCategory } from '@/hooks/useCategories';
import { useEffect, useState } from 'react';

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: {
    id: string;
    name: string;
    bg_color: string | null;
    text_color: string | null;
    border_color: string | null;
  };
}

export const CategoryForm = ({ open, onOpenChange, category }: CategoryFormProps) => {
  const isEditing = !!category;
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  // Track selected preset ID for UI
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      bg_color: '',
      text_color: '',
      border_color: '',
    },
  });

  // Reset form when category changes or dialog opens
  useEffect(() => {
    if (category) {
      // Editing mode: try to find matching preset
      const matchingPreset = findPresetByColors(
        category.bg_color,
        category.text_color,
        category.border_color
      );

      const preset = matchingPreset || getDefaultPreset();

      form.reset({
        name: category.name,
        bg_color: preset.bg_color,
        text_color: preset.text_color,
        border_color: preset.border_color,
      });
      
      setSelectedPresetId(preset.id);
    } else {
      // Create mode: use default preset
      const defaultPreset = getDefaultPreset();
      
      form.reset({
        name: '',
        bg_color: defaultPreset.bg_color,
        text_color: defaultPreset.text_color,
        border_color: defaultPreset.border_color,
      });
      
      setSelectedPresetId(defaultPreset.id);
    }
  }, [category, form, open]);

  const onSubmit = async (data: CategoryFormData) => {
    if (isEditing) {
      await updateCategory.mutateAsync({
        id: category.id,
        data: {
          name: data.name,
          bg_color: data.bg_color,
          text_color: data.text_color,
          border_color: data.border_color,
        },
      });
    } else {
      await createCategory.mutateAsync({
        name: data.name,
        bg_color: data.bg_color,
        text_color: data.text_color,
        border_color: data.border_color,
      });
    }
    onOpenChange(false);
  };

  const handleColorSelect = (preset: typeof CATEGORY_COLOR_PALETTE[0]) => {
    setSelectedPresetId(preset.id);
    form.setValue('bg_color', preset.bg_color, { shouldValidate: true });
    form.setValue('text_color', preset.text_color, { shouldValidate: true });
    form.setValue('border_color', preset.border_color, { shouldValidate: true });
  };

  const watchedValues = form.watch();
  const isPending = createCategory.isPending || updateCategory.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Group' : 'Create Group'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the group details below.'
              : 'Add a new group to organize your prompts.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Preview Badge */}
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="mb-3 text-sm font-medium text-muted-foreground">
                Preview:
              </p>
              <CategoryBadge
                name={watchedValues.name || 'Group Name'}
                bg_color={watchedValues.bg_color}
                text_color={watchedValues.text_color}
                border_color={watchedValues.border_color}
              />
            </div>

            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Marketing, Technical, Creative" />
                  </FormControl>
                  <FormDescription>
                    The group name (max 50 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Color Selection */}
            <FormItem>
              <FormLabel>Color *</FormLabel>
              <FormDescription className="mb-3">
                Choose a color theme for this group
              </FormDescription>
              <ColorSwatchSelector
                selectedPresetId={selectedPresetId}
                onSelect={handleColorSelect}
                error={form.formState.errors.bg_color?.message}
              />
            </FormItem>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? 'Saving...'
                  : isEditing
                  ? 'Update Group'
                  : 'Create Group'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
