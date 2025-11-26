import { useEffect, useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const AboutTab = () => {
  const { draftData, updateDraftField } = usePromptEditorStore();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  // Determine default active tab based on current data
  const getDefaultIconTab = () => {
    if (draftData?.image_url && draftData.image_url.trim()) return 'image';
    return 'emoji'; // default to emoji
  };

  const [activeIconTab, setActiveIconTab] = useState(getDefaultIconTab());

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
      // Update active tab based on new data
      setActiveIconTab(getDefaultIconTab());
    }
  }, [draftData, form]);

  const handleFieldChange = (field: keyof AboutTabFormData, value: any) => {
    updateDraftField(field, value);
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Form {...form}>
        <form className="space-y-6">
          {/* 1. Title */}
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

          {/* 2. Description */}
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

          {/* 3. Category */}
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
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
                  Optional - prompts without a category will be marked as "Uncategorized"
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 4. Icon (Tabbed: Emoji / Image) */}
          <div className="space-y-2">
            <FormLabel>Icon</FormLabel>
            <Tabs value={activeIconTab} onValueChange={setActiveIconTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-[200px]">
                <TabsTrigger value="emoji">Emoji</TabsTrigger>
                <TabsTrigger value="image">Image</TabsTrigger>
              </TabsList>

              <TabsContent value="emoji" className="mt-4">
                <FormField
                  control={form.control}
                  name="emoji"
                  render={({ field }) => (
                    <FormItem>
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
              </TabsContent>

              <TabsContent value="image" className="mt-4">
                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
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
                        Optional image URL to display with this prompt
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
          </div>
        </form>
      </Form>
    </div>
  );
};
