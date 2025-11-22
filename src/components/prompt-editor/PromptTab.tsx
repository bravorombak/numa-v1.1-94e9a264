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

  const promptText = draftData.prompt_text || '';

  const lineCount = promptText.length === 0 ? 1 : promptText.split('\n').length;

  const wordCount =
    promptText.trim().length === 0
      ? 0
      : promptText.trim().split(/\s+/).length;

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

      {/* Prompt editor with line numbers */}
      <div className="relative flex rounded-md border bg-background font-mono text-sm">
        {/* Line number gutter */}
        <div className="flex flex-col items-end gap-1 border-r bg-muted/60 px-3 py-3 text-xs text-muted-foreground select-none">
          {promptText.split('\n').map((_, idx) => (
            <span key={idx}>{idx + 1}</span>
          ))}
        </div>

        {/* Actual prompt textarea */}
        <Textarea
          value={promptText}
          onChange={(e) => handlePromptChange(e.target.value)}
          placeholder="Enter your prompt text here. Use {{variable_name}} to insert variables."
          className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[280px] resize-none"
          spellCheck={false}
        />
      </div>

      {/* Line and word counter */}
      <div className="mt-2 flex justify-end gap-4 text-xs text-muted-foreground">
        <span>
          {lineCount} {lineCount === 1 ? 'line' : 'lines'}
        </span>
        <span>
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </span>
      </div>

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
