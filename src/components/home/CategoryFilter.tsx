import { CategoryBadge } from '@/components/categories/CategoryBadge';
import { Button } from '@/components/ui/button';
import { useCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryFilterProps {
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export const CategoryFilter = ({
  selectedCategoryId,
  onSelectCategory,
}: CategoryFilterProps) => {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="overflow-x-auto pb-2 no-scrollbar">
        <div className="flex gap-2 whitespace-nowrap">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-24 shrink-0 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-2 no-scrollbar">
      <div className="flex gap-2 whitespace-nowrap">
        {/* All button */}
        <Button
          variant={selectedCategoryId === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelectCategory(null)}
          className="shrink-0 rounded-full"
        >
          All
        </Button>

        {/* Category chips */}
        {categories?.map((category) => {
          const isSelected = selectedCategoryId === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className="shrink-0 transition-opacity hover:opacity-80"
              style={{
                opacity: isSelected ? 1 : 0.7,
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              <CategoryBadge
                name={category.name}
                bg_color={(category as any).bg_color || '#f2f1f0'}
                text_color={(category as any).text_color || '#2b2b2b'}
                border_color={(category as any).border_color || '#D1D1D1'}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
