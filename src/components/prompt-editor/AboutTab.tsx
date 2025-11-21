import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { aboutTabSchema, type AboutTabFormData } from '@/lib/promptValidation';
import { usePromptEditorStore } from '@/stores/promptEditorStore';
import { useCategories } from '@/hooks/useCategories';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const AboutTab = () => {
  const { draftData, updateDraftField } = usePromptEditorStore();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const form = useForm<AboutTabFormData>({
    resolver: zodResolver(aboutTabSchema),
    defaultValues: {
      title: draftData?.title || '',
      description: draftData?.description || '',
      emoji: draftData?.emoji || '',
      image_url: draftData?.image_url || '',
      category_id: draftData?.category_id || '',
    },
  });

  // Update form when draftData changes
  useEffect(() => {
    if (draftData) {
      form.reset({
        title: draftData.title || '',
        description: draftData.description || '',
        emoji: draftData.emoji || '',
        image_url: draftData.image_url || '',
        category_id: draftData.category_id || '',
      });
    }
  }, [draftData, form]);

  const handleFieldChange = (field: keyof AboutTabFormData, value: any) => {
    updateDraftField(field, value);
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="emoji"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emoji</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange('emoji', e.target.value);
                    }}
                    placeholder="😀"
                    maxLength={10}
                  />
                </FormControl>
                <FormDescription>
                  A single emoji to represent this prompt
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange('title', e.target.value);
                    }}
                    placeholder="Enter prompt title"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange('description', e.target.value);
                    }}
                    placeholder="Brief description of this prompt"
                    maxLength={280}
                    rows={3}
                  />
                </FormControl>
                <FormDescription>
                  {field.value?.length || 0} / 280 characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select
                  value={field.value || ''}
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleFieldChange('category_id', value);
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoriesLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : categories && categories.length > 0 ? (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No categories available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Category is required to save this prompt
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange('image_url', e.target.value);
                    }}
                    placeholder="https://example.com/image.jpg"
                    type="url"
                  />
                </FormControl>
                <FormDescription>
                  Optional image to display with this prompt
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};
