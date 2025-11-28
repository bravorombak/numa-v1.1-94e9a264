import { useParams, useNavigate } from "react-router-dom";
import { usePromptVersion } from "@/hooks/usePromptDrafts";
import { useModels } from "@/hooks/useModels";
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle, Settings } from "lucide-react";
import { PromptRunForm } from "@/components/prompts/run/PromptRunForm";
import { formatDistanceToNow } from "date-fns";

const PromptRunPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const canEdit = profile?.role === 'admin' || profile?.role === 'editor';
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
    <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8 p-4 sm:p-6">
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="flex items-center gap-4 flex-1">
            {promptVersion.icon_type === 'image' && promptVersion.icon_value ? (
              <img
                src={promptVersion.icon_value}
                alt=""
                className="w-12 h-12 rounded object-cover flex-shrink-0"
              />
            ) : promptVersion.icon_type === 'emoji' && promptVersion.icon_value ? (
              <span className="text-4xl flex-shrink-0">{promptVersion.icon_value}</span>
            ) : promptVersion.emoji ? (
              <span className="text-4xl flex-shrink-0">{promptVersion.emoji}</span>
            ) : promptVersion.image_url ? (
              <img
                src={promptVersion.image_url}
                alt=""
                className="w-12 h-12 rounded object-cover flex-shrink-0"
              />
            ) : null}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-header font-extrabold mb-2 text-foreground">{promptVersion.title}</h1>
            </div>
          </div>
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/prompts/${promptVersion.prompt_draft_id}/edit`)}
              className="gap-2 w-full sm:w-auto"
            >
              <Settings className="h-4 w-4" />
              Edit
            </Button>
          )}
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
