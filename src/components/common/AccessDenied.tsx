import { ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AccessDeniedProps {
  message?: string;
}

export const AccessDenied = ({ message }: AccessDeniedProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              {message || "You don't have permission to access this page."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
