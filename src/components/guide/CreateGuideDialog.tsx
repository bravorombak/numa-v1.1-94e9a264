import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCreateGuidePage, type GuideTreeItem } from "@/hooks/useGuide";
import { generateSlug } from "@/lib/guideUtils";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().optional(),
  parent_id: z.string().nullable(),
  is_published: z.boolean(),
});

interface CreateGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pages: GuideTreeItem[];
}

export function CreateGuideDialog({ open, onOpenChange, pages }: CreateGuideDialogProps) {
  const createPage = useCreateGuidePage();
  const [autoSlug, setAutoSlug] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      parent_id: null,
      is_published: true,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const slug = values.slug || generateSlug(values.title);
    await createPage.mutateAsync({
      title: values.title,
      slug,
      parent_id: values.parent_id,
      is_published: values.is_published,
      content_md: "",
      sort_order: 0,
    });
    onOpenChange(false);
    form.reset();
    setAutoSlug(true);
  };

  const handleTitleChange = (value: string) => {
    form.setValue("title", value);
    if (autoSlug) {
      form.setValue("slug", generateSlug(value));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Guide Page</DialogTitle>
          <DialogDescription>
            Add a new page to your guide. You can edit the content after creating it.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Getting Started"
                      {...field}
                      onChange={(e) => handleTitleChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="getting-started"
                      {...field}
                      onChange={(e) => {
                        setAutoSlug(false);
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parent_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Page</FormLabel>
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent page" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Top-level sentinel – MUST NOT be empty string */}
                      <SelectItem value="none">None (Root level)</SelectItem>

                      {/* Defensive: never render an item with an empty id */}
                      {pages
                        .filter((page) => page.id && page.id.trim() !== "")
                        .map((page) => (
                          <SelectItem key={page.id} value={page.id}>
                            {page.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_published"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Published</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Make this page visible in the guide
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createPage.isPending}>
                {createPage.isPending ? "Creating..." : "Create Page"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
