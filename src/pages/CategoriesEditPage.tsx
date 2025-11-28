import { useState } from 'react';
import { CategoryTable } from '@/components/categories/CategoryTable';
import { CategoryForm } from '@/components/categories/CategoryForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AccessDenied } from '@/components/common/AccessDenied';
import { useAuthStore } from '@/stores/authStore';

const CategoriesEditPage = () => {
  const { isAdmin, isEditor } = useAuthStore();
  const [createFormOpen, setCreateFormOpen] = useState(false);

  // Admin/Editor guard
  if (!isAdmin && !isEditor) {
    return <AccessDenied message="Only Admins and Editors can manage groups." />;
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-header font-extrabold tracking-tight text-foreground">Groups</h1>
          <p className="mt-2 text-muted-foreground">
            Organize your prompts with preset color themes.
          </p>
        </div>
        <Button onClick={() => setCreateFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      {/* Main Content */}
      <CategoryTable />

      {/* Create Form Dialog */}
      <CategoryForm
        open={createFormOpen}
        onOpenChange={setCreateFormOpen}
      />
    </div>
  );
};

export default CategoriesEditPage;
