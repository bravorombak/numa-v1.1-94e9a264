import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination';

interface TeamPaginationProps {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function TeamPagination({ page, totalPages, onPrevious, onNext }: TeamPaginationProps) {
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages || totalPages === 0;

  return (
    <div className="flex items-center justify-between py-4">
      <div className="text-sm text-muted-foreground">
        Showing page {page} of {totalPages}
      </div>
      
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="outline"
              size="default"
              onClick={onPrevious}
              disabled={isFirstPage}
              className="gap-1 pl-2.5"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>
          </PaginationItem>
          
          <PaginationItem>
            <Button
              variant="outline"
              size="default"
              onClick={onNext}
              disabled={isLastPage}
              className="gap-1 pr-2.5"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
