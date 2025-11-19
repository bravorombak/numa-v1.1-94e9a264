import { usePromptEditorStore } from '@/stores/promptEditorStore';
import { extractVariables, syncVariablesFromDetected, type PromptVariable } from '@/lib/variableDetection';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export const PromptTab = () => {
  const { draftData, detectedVariables, updateDraftField, setDetectedVariables, setDirty } = usePromptEditorStore();

  if (!draftData) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Loading prompt...</p>
      </div>
    );
  }

  const handlePromptChange = (value: string) => {
    // Update prompt text
    updateDraftField('prompt_text', value);
    
    // Extract variables
    const detected = extractVariables(value);
    setDetectedVariables(detected);
    
    // Sync with existing variable configs
    const currentVariables = Array.isArray(draftData.variables) 
      ? (draftData.variables as unknown as PromptVariable[])
      : [];
    const updatedVariables = syncVariablesFromDetected(detected, currentVariables);
    updateDraftField('variables', updatedVariables);
    
    setDirty(true);
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Prompt</h2>
        <Badge variant="secondary">
          {detectedVariables.length} {detectedVariables.length === 1 ? 'variable' : 'variables'} detected
        </Badge>
      </div>

      {/* Textarea */}
      <Textarea
        value={draftData.prompt_text || ''}
        onChange={(e) => handlePromptChange(e.target.value)}
        placeholder="Enter your prompt text here. Use {{variable_name}} to insert variables."
        className="min-h-[400px] font-mono text-sm"
      />

      {/* Variable chips */}
      {detectedVariables.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Detected variables:</span>
          {detectedVariables.map((varName) => (
            <Badge key={varName} variant="outline" className="font-mono text-xs">
              {`{{${varName}}}`}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
