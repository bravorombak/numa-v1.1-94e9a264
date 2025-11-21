import { useState } from 'react';
import { CategoryBadge } from './CategoryBadge';
import { CategoryForm } from './CategoryForm';
import { useCategories, useDeleteCategory } from '@/hooks/useCategories';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Category = Tables<'categories'>;

export const CategoryTable = () => {
  const { data: categories, isLoading, isError } = useCategories();
  const deleteCategory = useDeleteCategory();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteClick = (category: Category) => {
    setDeletingCategory(category);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    await deleteCategory.mutateAsync({ id: deletingCategory.id });
    setDeletingCategory(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border border-destructive bg-destructive/10 p-6 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <p>Failed to load categories. Please try again.</p>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/25 py-12 text-center">
        <p className="text-muted-foreground">
          No categories yet. Create your first category to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <CategoryBadge
                    name={category.name}
                    bg_color={category.bg_color || '#f2f1f0'}
                    text_color={category.text_color || '#2b2b2b'}
                    border_color={category.border_color || '#D1D1D1'}
                  />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(category)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(category)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit/Create Form Dialog */}
      <CategoryForm
        open={formOpen}
        onOpenChange={handleFormClose}
        category={editingCategory || undefined}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category and set all associated prompts to
              "Uncategorized". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deletingCategory && (
            <div className="my-2 rounded-md bg-muted px-3 py-2">
              <CategoryBadge
                name={deletingCategory.name}
                bg_color={deletingCategory.bg_color || '#f2f1f0'}
                text_color={deletingCategory.text_color || '#2b2b2b'}
                border_color={deletingCategory.border_color || '#D1D1D1'}
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCategory.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
              disabled={deleteCategory.isPending}
            >
              {deleteCategory.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
