import { usePromptEditorStore } from '@/stores/promptEditorStore';
import { usePromptVersions, usePublishPromptVersion } from '@/hooks/usePromptDrafts';
import { useModels } from '@/hooks/useModels';
import { useCategories } from '@/hooks/useCategories';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import type { PromptVariable } from '@/lib/variableDetection';

export const VersionTab = () => {
  const { draftData } = usePromptEditorStore();
  const publishVersion = usePublishPromptVersion();

  if (!draftData) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const handlePublish = async () => {
    const errors: string[] = [];
    
    if (!draftData?.title || draftData.title.trim() === '') {
      errors.push('Title is required');
    }
    
    if (!draftData?.prompt_text || draftData.prompt_text.trim() === '') {
      errors.push('Prompt text is required');
    }
    
    if (!draftData?.model_id) {
      errors.push('Model must be selected');
    }
    
    if (errors.length > 0) {
      toast({
        title: "Cannot publish",
        description: errors.join('. ') + '.',
        variant: "destructive",
      });
      return;
    }
    
    try {
      await publishVersion.mutateAsync({ draft: draftData });
    } catch (error) {
      console.error('Publish error:', error);
    }
  };

  return (
    <div className="px-4 py-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Version & Publish</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Compare the current draft with the last published version and publish a new version when ready.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CurrentDraftCard draftData={draftData} />
        <PublishedVersionCard draftData={draftData} />
      </div>

      <ChangesSummary draftData={draftData} />

      <div className="flex justify-end">
        <Button 
          onClick={handlePublish}
          disabled={!draftData || publishVersion.isPending}
          size="lg"
        >
          {publishVersion.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            'Publish new version'
          )}
        </Button>
      </div>
    </div>
  );
};

const CurrentDraftCard = ({ draftData }: { draftData: any }) => {
  const { data: categories } = useCategories();
  const { data: models } = useModels();
  
  const category = categories?.find(c => c.id === draftData?.category_id);
  const model = models?.find(m => m.id === draftData?.model_id);
  
  const variablesCount = Array.isArray(draftData?.variables) 
    ? (draftData.variables as any[]).length 
    : 0;
  
  const promptSnippet = draftData?.prompt_text 
    ? draftData.prompt_text.length > 120 
      ? draftData.prompt_text.substring(0, 120) + '...'
      : draftData.prompt_text
    : 'No prompt text';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {draftData?.emoji && <span className="text-2xl">{draftData.emoji}</span>}
          <span>Current Draft</span>
        </CardTitle>
        <CardDescription>Unsaved changes in the editor</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-sm font-medium text-muted-foreground">Title</div>
          <div className="text-sm">{draftData?.title || 'Untitled'}</div>
        </div>
        
        {category && (
          <div>
            <div className="text-sm font-medium text-muted-foreground">Category</div>
            <Badge variant="secondary">{category.name}</Badge>
          </div>
        )}
        
        <div>
          <div className="text-sm font-medium text-muted-foreground">Model</div>
          <div className="text-sm">
            {model ? model.name : <span className="text-destructive">Not selected</span>}
          </div>
        </div>
        
        <div>
          <div className="text-sm font-medium text-muted-foreground">Prompt</div>
          <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
            {promptSnippet}
          </div>
        </div>
        
        <div>
          <div className="text-sm font-medium text-muted-foreground">Variables</div>
          <div className="text-sm">{variablesCount} variable{variablesCount !== 1 ? 's' : ''}</div>
        </div>
      </CardContent>
    </Card>
  );
};

const PublishedVersionCard = ({ draftData }: { draftData: any }) => {
  const { data: versions, isLoading } = usePromptVersions(draftData?.id || '');
  const { data: models } = useModels();
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  
  if (!versions || versions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Last Published Version</CardTitle>
          <CardDescription>No versions yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No versions published yet. When you publish, the latest version will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const latestVersion = versions[0];
  const model = models?.find(m => m.id === latestVersion.model_id);
  const variablesCount = Array.isArray(latestVersion.variables) 
    ? (latestVersion.variables as any[]).length 
    : 0;
  
  const promptSnippet = latestVersion.prompt_text.length > 120 
    ? latestVersion.prompt_text.substring(0, 120) + '...'
    : latestVersion.prompt_text;
  
  const publishedDate = latestVersion.published_at 
    ? format(new Date(latestVersion.published_at), 'PPP')
    : 'Unknown date';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {latestVersion.emoji && <span className="text-2xl">{latestVersion.emoji}</span>}
          <span>Last Published Version</span>
          <Badge variant="outline">v{latestVersion.version_number}</Badge>
        </CardTitle>
        <CardDescription>Published on {publishedDate}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-sm font-medium text-muted-foreground">Title</div>
          <div className="text-sm">{latestVersion.title}</div>
        </div>
        
        <div>
          <div className="text-sm font-medium text-muted-foreground">Model</div>
          <div className="text-sm">{model ? model.name : 'Not set'}</div>
        </div>
        
        <div>
          <div className="text-sm font-medium text-muted-foreground">Prompt</div>
          <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
            {promptSnippet}
          </div>
        </div>
        
        <div>
          <div className="text-sm font-medium text-muted-foreground">Variables</div>
          <div className="text-sm">{variablesCount} variable{variablesCount !== 1 ? 's' : ''}</div>
        </div>
      </CardContent>
    </Card>
  );
};

const ChangesSummary = ({ draftData }: { draftData: any }) => {
  const { data: versions } = usePromptVersions(draftData?.id || '');
  
  if (!versions || versions.length === 0) {
    return null;
  }
  
  const latestVersion = versions[0];
  const changes: string[] = [];
  
  if (draftData?.title !== latestVersion.title) {
    changes.push('Title changed');
  }
  
  if (draftData?.model_id !== latestVersion.model_id) {
    changes.push('Model changed');
  }
  
  if (draftData?.prompt_text !== latestVersion.prompt_text) {
    changes.push('Prompt text changed');
  }
  
  const draftVarsCount = Array.isArray(draftData?.variables) 
    ? draftData.variables.length 
    : 0;
  const versionVarsCount = Array.isArray(latestVersion.variables) 
    ? (latestVersion.variables as any[]).length 
    : 0;
  
  if (draftVarsCount !== versionVarsCount) {
    changes.push('Variables changed');
  }
  
  if (draftData?.category_id !== latestVersion.category_id) {
    changes.push('Category changed');
  }
  
  if (changes.length === 0) {
    return (
      <Alert className="mb-4">
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>
          No changes detected since last published version.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="font-medium mb-2">Changes since last version:</div>
        <ul className="list-disc list-inside space-y-1">
          {changes.map((change, idx) => (
            <li key={idx} className="text-sm">{change}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};
