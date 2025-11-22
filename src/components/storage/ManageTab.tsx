import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStorageStats, useClearStorage, formatBytes } from '@/hooks/useStorage';
import { AlertCircle, HardDrive, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

const CLEANUP_RANGES = [
  { value: 'today', label: 'Today' },
  { value: '1-week', label: 'Last Week' },
  { value: '1-month', label: 'Last Month' },
  { value: '3-month', label: 'Last 3 Months' },
  { value: '7-month', label: 'Last 7 Months' },
  { value: '1-year', label: 'Last Year' },
] as const;

export const ManageTab = () => {
  const { data: stats, isLoading: isLoadingStats, error: statsError } = useStorageStats();
  const clearStorage = useClearStorage();

  const handleClear = (range: typeof CLEANUP_RANGES[number]['value']) => {
    if (confirm(`Are you sure you want to delete files older than ${range.replace('-', ' ')}? This cannot be undone.`)) {
      clearStorage.mutate({ range });
    }
  };

  if (isLoadingStats) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Storage Usage</CardTitle>
            </div>
            <CardDescription>Current storage usage across all uploaded files</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-24 mt-4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (statsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load storage statistics: {statsError.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Storage Usage Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Storage Usage</CardTitle>
          </div>
          <CardDescription>
            Current storage usage across all uploaded files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Used</span>
              <span className="font-medium">{formatBytes(stats?.usedBytes || 0)}</span>
            </div>
            <Progress value={stats?.percentageUsed || 0} className="h-2" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Available</span>
              <span className="font-medium">{formatBytes(stats?.totalBytes || 0)}</span>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Percentage Used</span>
              <span className="text-2xl font-bold">
                {stats?.percentageUsed.toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cleanup Card */}
      <Card>
        <CardHeader>
          <CardTitle>Cleanup Storage</CardTitle>
          <CardDescription>
            Delete files and their corresponding logs by date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CLEANUP_RANGES.map(({ value, label }) => (
              <Button
                key={value}
                variant="outline"
                onClick={() => handleClear(value)}
                disabled={clearStorage.isPending}
                className="w-full"
              >
                {clearStorage.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {label}
              </Button>
            ))}
          </div>

          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Cleanup actions are permanent and cannot be undone. Files older than the selected range
              and their corresponding storage logs will be deleted.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
