import { useState } from 'react';
import { CategoryTable } from '@/components/categories/CategoryTable';
import { CategoryForm } from '@/components/categories/CategoryForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const CategoriesEditPage = () => {
  const [createFormOpen, setCreateFormOpen] = useState(false);

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="mt-2 text-muted-foreground">
            Organize your prompts with preset color themes.
          </p>
        </div>
        <Button onClick={() => setCreateFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Category
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
