import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash2, Eye } from "lucide-react";
import { MarkdownToolbar } from "@/components/guide/MarkdownToolbar";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { GuideMarkdown } from "@/components/guide/GuideMarkdown";
import {
  useUpdateGuidePage,
  useDeleteGuidePage,
  type GuidePage,
  type GuideTreeItem,
} from "@/hooks/useGuide";
import { generateSlug } from "@/lib/guideUtils";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().min(1, "Slug is required"),
  content_md: z.string(),
  parent_id: z.string().nullable(),
  sort_order: z.number().int().min(0),
  is_published: z.boolean(),
});

interface GuideEditorProps {
  page: GuidePage;
  allPages: GuideTreeItem[];
}

export function GuideEditor({ page, allPages }: GuideEditorProps) {
  const updatePage = useUpdateGuidePage();
  const deletePage = useDeleteGuidePage();
  const [isDirty, setIsDirty] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: page.title,
      slug: page.slug,
      content_md: page.content_md || "",
      parent_id: page.parent_id,
      sort_order: page.sort_order,
      is_published: page.is_published,
    },
  });

  // Reset form when page changes
  useEffect(() => {
    form.reset({
      title: page.title,
      slug: page.slug,
      content_md: page.content_md || "",
      parent_id: page.parent_id,
      sort_order: page.sort_order,
      is_published: page.is_published,
    });
    setIsDirty(false);
  }, [page.id, form]);

  // Track form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setIsDirty(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await updatePage.mutateAsync({
      id: page.id,
      ...values,
    });
    setIsDirty(false);
  };

  const handleDelete = async () => {
    await deletePage.mutateAsync(page.id);
  };

  // Filter out current page from parent options to prevent self-parenting
  const parentOptions = allPages.filter((p) => p.id !== page.id);

  return (
    <div className="h-full flex flex-col w-full max-w-4xl mx-auto">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <h2 className="text-lg font-semibold truncate">Edit Page</h2>
          {isDirty && (
            <Badge variant="outline" className="text-xs flex-shrink-0">
              Unsaved changes
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={form.handleSubmit(onSubmit)}
            disabled={updatePage.isPending || !isDirty}
            className="w-full sm:w-auto"
          >
            {updatePage.isPending ? "Saving..." : "Save"}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete page?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{page.title}". This action cannot be undone.
                  {allPages.some((p) => p.parent_id === page.id) && (
                    <span className="block mt-2 text-destructive font-medium">
                      Warning: This page has child pages. Delete them first.
                    </span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-hidden">
          <Tabs defaultValue="edit" className="h-full flex flex-col">
            <div className="border-b px-6">
              <TabsList>
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="edit" className="flex-1 overflow-y-auto px-4 py-4 sm:p-6 space-y-4 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="parent_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Page</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? null : value)
                        }
                        value={field.value || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None (Root level)</SelectItem>
                          {parentOptions.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.title}
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
                  name="sort_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content_md"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content (Markdown)</FormLabel>
                    <MarkdownToolbar
                      textareaRef={textareaRef}
                      onContentChange={(content) => form.setValue("content_md", content)}
                    />
                    <FormControl>
                      <Textarea
                        {...field}
                        ref={textareaRef}
                        className="min-h-[400px] font-mono text-sm"
                        placeholder="Write your guide content in markdown..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="preview" className="flex-1 overflow-y-auto px-4 py-4 sm:p-6 mt-0">
              <Card className="p-6">
                <h1 className="text-3xl font-bold mb-6">{form.watch("title")}</h1>
                <div className="prose prose-sm max-w-none">
                  <GuideMarkdown content={form.watch("content_md") || "*No content yet*"} />
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}
