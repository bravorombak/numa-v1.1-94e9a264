import { useState, useEffect } from 'react';
import { usePublishedPrompts } from '@/hooks/usePromptDrafts';
import { CategoryFilter } from '@/components/home/CategoryFilter';
import { ViewModeToggle } from '@/components/home/ViewModeToggle';
import { PromptCard } from '@/components/home/PromptCard';
import { PromptListItem } from '@/components/home/PromptListItem';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';

const STORAGE_KEY = 'numa.home.viewMode';

const HomePage = () => {
  const { data: prompts, isLoading, isError, refetch } = usePublishedPrompts();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list'>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved === 'list' ? 'list' : 'card') as 'card' | 'list';
  });

  // Persist view mode preference
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, viewMode);
  }, [viewMode]);

  // Filter prompts by selected category
  const filteredPrompts = prompts?.filter((prompt) => {
    if (selectedCategoryId === null) return true;
    return prompt.category_id === selectedCategoryId;
  });

  return (
    <div className="container mx-auto max-w-7xl space-y-6 py-8 px-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Home</h1>
        <p className="mt-2 text-muted-foreground">
          Browse published prompts and start a session.
        </p>
      </div>

      {/* Category Filter + View Mode Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <CategoryFilter
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />
        </div>
        <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-64 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load prompts. Please try again.</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="ml-4"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredPrompts?.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            {selectedCategoryId
              ? 'No prompts in this category yet.'
              : 'No published prompts yet.'}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Publish a prompt from the Prompt Editor to see it here.
          </p>
        </div>
      )}

      {/* Card View */}
      {!isLoading &&
        !isError &&
        viewMode === 'card' &&
        filteredPrompts &&
        filteredPrompts.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPrompts.map((prompt: any) => (
              <PromptCard
                key={prompt.id}
                id={prompt.id}
                title={prompt.title}
                description={prompt.description}
                emoji={prompt.emoji}
                category={prompt.categories}
                model={prompt.models}
                published_at={prompt.published_at}
              />
            ))}
          </div>
        )}

      {/* List View */}
      {!isLoading &&
        !isError &&
        viewMode === 'list' &&
        filteredPrompts &&
        filteredPrompts.length > 0 && (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrompts.map((prompt: any) => (
                  <PromptListItem
                    key={prompt.id}
                    id={prompt.id}
                    title={prompt.title}
                    emoji={prompt.emoji}
                    category={prompt.categories}
                    model={prompt.models}
                    published_at={prompt.published_at}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
    </div>
  );
};

export default HomePage;
