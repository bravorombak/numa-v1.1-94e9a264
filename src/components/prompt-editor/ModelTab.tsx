import { usePromptEditorStore } from '@/stores/promptEditorStore';
import { useModels, type Model } from '@/hooks/useModels';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

const providerNames: Record<Model['provider'], string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
  perplexity: 'Perplexity',
};

export const ModelTab = () => {
  const { draftData, updateDraftField } = usePromptEditorStore();
  const { data: models, isLoading, error } = useModels();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Loading models...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load models. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Filter to show only active + deprecated (no disabled)
  const selectableModels = models?.filter(m => m.status !== 'disabled') ?? [];

  // Find currently selected model
  const selectedModel = models?.find(m => m.id === draftData?.model_id) ?? null;

  const handleModelChange = (modelId: string) => {
    updateDraftField('model_id', modelId);
  };

  return (
    <div className="px-4 py-4 sm:p-6 max-w-2xl">
      <div className="space-y-2 mb-6">
        <h2 className="text-2xl font-semibold">Model</h2>
        <p className="text-sm text-muted-foreground">
          Select which AI model should be used when running and publishing this prompt.
        </p>
      </div>

      {/* Status Messages */}
      {!draftData?.model_id && (
        <Alert variant="default" className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            No model selected yet. This prompt cannot be run or published until a model is chosen.
          </AlertDescription>
        </Alert>
      )}

      {selectedModel?.status === 'deprecated' && (
        <Alert variant="default" className="mb-4 border-yellow-500/50 text-yellow-900 dark:text-yellow-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This model is deprecated and may be removed in the future. Consider switching to an active model.
          </AlertDescription>
        </Alert>
      )}

      {selectedModel?.status === 'disabled' && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This model is disabled and cannot be used. Please select another model.
          </AlertDescription>
        </Alert>
      )}

      {/* Model Select */}
      <div className="space-y-2">
        <Label htmlFor="model-select">AI Model *</Label>
        <Select value={draftData?.model_id || ''} onValueChange={handleModelChange}>
          <SelectTrigger id="model-select">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {selectableModels.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name} · {model.provider_model} ({providerNames[model.provider]})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Only active and deprecated models are shown. Disabled models cannot be selected.
        </p>
      </div>

      {/* Model Details Panel */}
      {selectedModel && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-4">Model Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Provider:</span>
                <span className="font-medium">{providerNames[selectedModel.provider]}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Provider Model:</span>
                <span className="font-mono text-xs">{selectedModel.provider_model}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status:</span>
                <Badge 
                  variant={
                    selectedModel.status === 'active' 
                      ? 'default' 
                      : selectedModel.status === 'deprecated'
                      ? 'secondary'
                      : 'destructive'
                  }
                >
                  {selectedModel.status}
                </Badge>
              </div>
              {selectedModel.max_tokens && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Max Tokens:</span>
                  <span>{selectedModel.max_tokens.toLocaleString()}</span>
                </div>
              )}
              {selectedModel.description && (
                <div className="pt-2 border-t">
                  <span className="text-muted-foreground block mb-1">Description:</span>
                  <p className="text-xs">{selectedModel.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
