import { useState } from 'react';
import { useStorageLogs, useDeleteStorageLog, formatBytes } from '@/hooks/useStorage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, Search, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export const LogsTab = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data, isLoading, error } = useStorageLogs({ 
    page, 
    pageSize: 20, 
    search: debouncedSearch 
  });
  
  const deleteLog = useDeleteStorageLog();

  // Simple debounce for search
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setTimeout(() => setDebouncedSearch(value), 500);
  };

  const handleDelete = async (logId: string) => {
    await deleteLog.mutateAsync(logId);
  };

  const extractFilename = (path: string) => {
    return path.split('/').pop() || path;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-destructive">
          Error loading logs: {error.message}
        </CardContent>
      </Card>
    );
  }

  const logs = data?.logs || [];
  const totalPages = data?.totalPages || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage Logs</CardTitle>
        <CardDescription>
          View and manage uploaded files. Total: {data?.totalCount || 0} files
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by filename..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Table */}
        {logs.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            {debouncedSearch ? 'No files found matching your search.' : 'No files uploaded yet.'}
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Uploaded At</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        {extractFilename(log.path)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.content_type || 'unknown'}
                      </TableCell>
                      <TableCell>
                        {formatBytes(log.size_bytes || 0)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {log.user_id ? log.user_id.slice(0, 8) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.created_at
                          ? format(new Date(log.created_at), 'MMM d, yyyy HH:mm')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={deleteLog.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete File</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{extractFilename(log.path)}"?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(log.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
