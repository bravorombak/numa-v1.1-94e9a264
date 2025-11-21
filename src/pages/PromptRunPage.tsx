import { useParams, useNavigate } from "react-router-dom";
import { usePromptVersion } from "@/hooks/usePromptDrafts";
import { useModels } from "@/hooks/useModels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle, Settings } from "lucide-react";
import { PromptRunForm } from "@/components/prompts/run/PromptRunForm";
import { formatDistanceToNow } from "date-fns";

const PromptRunPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: promptVersion, isLoading, error } = usePromptVersion(id!);
  const { data: models } = useModels();

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

  const modelName = models?.find(m => m.id === promptVersion.model_id)?.name;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/')}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Library
      </Button>

      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex items-center gap-4 flex-1">
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
              <h1 className="text-3xl font-bold mb-2">{promptVersion.title}</h1>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/prompts/${promptVersion.prompt_draft_id}/edit`)}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Edit
          </Button>
        </div>
        
        {/* Metadata Row */}
        <div className="text-sm text-muted-foreground">
          v{promptVersion.version_number}
          {modelName && (
            <>
              {' • '}
              {modelName}
            </>
          )}
          {promptVersion.published_at && (
            <>
              {' • '}
              Updated {formatDistanceToNow(new Date(promptVersion.published_at), { addSuffix: true })}
            </>
          )}
        </div>

        {promptVersion.description && (
          <p className="text-muted-foreground">{promptVersion.description}</p>
        )}
      </div>

      {/* Model warning banner */}
      {!promptVersion.model_id && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>No AI model selected.</strong> Please edit this prompt and select a model in the Model tab before running it.
          </AlertDescription>
        </Alert>
      )}

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
