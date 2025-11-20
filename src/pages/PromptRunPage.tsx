import { useParams } from "react-router-dom";
import { usePromptVersion } from "@/hooks/usePromptDrafts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { PromptRunForm } from "@/components/prompts/run/PromptRunForm";

const PromptRunPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: promptVersion, isLoading, error } = usePromptVersion(id!);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading prompt...</p>
        </div>
      </div>
    );
  }

  if (error || !promptVersion) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No published version found. Please publish a version in the Prompt Editor first.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          {promptVersion.emoji ? (
            <div className="text-5xl">{promptVersion.emoji}</div>
          ) : promptVersion.image_url ? (
            <img
              src={promptVersion.image_url}
              alt={promptVersion.title}
              className="h-16 w-16 rounded-lg object-cover"
            />
          ) : null}
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{promptVersion.title}</h1>
          </div>
        </div>
        {promptVersion.description && (
          <p className="text-muted-foreground">{promptVersion.description}</p>
        )}
      </div>

      {/* Inputs Card */}
      <Card>
        <CardHeader>
          <CardTitle>Inputs</CardTitle>
        </CardHeader>
        <CardContent>
          <PromptRunForm promptVersion={promptVersion} />
        </CardContent>
      </Card>
    </div>
  );
};

export default PromptRunPage;
