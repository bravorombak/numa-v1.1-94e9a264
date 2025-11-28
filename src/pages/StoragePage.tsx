import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ManageTab } from '@/components/storage/ManageTab';
import { LogsTab } from '@/components/storage/LogsTab';
import { useAuthStore } from '@/stores/authStore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert, Loader2 } from 'lucide-react';

const StoragePage = () => {
  const [activeTab, setActiveTab] = useState('manage');
  const { hasRole, loading } = useAuthStore();
  const isAdmin = hasRole('admin');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            Admin access required to view storage management.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-header font-extrabold">Storage</h1>
        <p className="text-muted-foreground mt-2">
          Manage file storage and view upload logs.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="manage">Manage</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="mt-6">
          <ManageTab />
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <LogsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StoragePage;
