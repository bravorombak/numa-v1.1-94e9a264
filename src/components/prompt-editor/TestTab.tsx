import { useState } from 'react';
import { usePromptEditorStore } from '@/stores/promptEditorStore';
import { useModels } from '@/hooks/useModels';
import { useGenerate } from '@/hooks/useGenerate';
import type { PromptVariable } from '@/lib/variableDetection';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Loader2, AlertCircle } from 'lucide-react';

const providerNames: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
  perplexity: 'Perplexity',
};

export const TestTab = () => {
  const { draftData } = usePromptEditorStore();
  const { data: models } = useModels();
  const generateMutation = useGenerate();
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isRunning = generateMutation.isPending;

  if (!draftData) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Loading prompt...</p>
      </div>
    );
  }

  const variables = Array.isArray(draftData.variables)
    ? (draftData.variables as unknown as PromptVariable[])
    : [];

  const selectedModel = models?.find(m => m.id === draftData.model_id);

  const handleInputChange = (name: string, value: string) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    variables.forEach(variable => {
      if (variable.required) {
        const value = formValues[variable.name]?.trim();
        if (!value) {
          newErrors[variable.name] = 'This field is required';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getErrorTitle = (code?: string): string => {
    const mapping: Record<string, string> = {
      RATE_LIMITED: 'Rate Limit Exceeded',
      MODEL_NOT_FOUND: 'Model Not Found',
      MODEL_DISABLED: 'Model Disabled',
      MODEL_AUTH_ERROR: 'Model Authentication Error',
      MODEL_RATE_LIMITED: 'Model Provider Rate Limited',
      MODEL_TIMEOUT: 'Request Timeout',
      MODEL_UNAVAILABLE: 'Model Unavailable',
      INVALID_VARIABLES: 'Invalid Variables',
      PROMPT_NOT_FOUND: 'Prompt Not Found',
      PROVIDER_ERROR: 'Provider Error',
      INTERNAL_ERROR: 'Internal Error',
      NETWORK_ERROR: 'Network Error',
    };
    return mapping[code || ''] || 'Generation Error';
  };

  const handleRunTest = async () => {
    generateMutation.reset();
    if (!draftData) return;

    if (!validateForm()) {
      return;
    }

    // If no model selected, bail early
    if (!draftData.model_id) return;

    try {
      await generateMutation.mutateAsync({
        // Canonical contract
        prompt: draftData.prompt_text,
        variables: formValues,
        model_id: draftData.model_id,
        files: [],

        // Convenience: include draft reference for logging/context
        prompt_draft_id: draftData.id,
      });
    } catch {
      // Error is handled via mutation + UI, no rethrow needed
    }
  };

  const renderVariableInput = (variable: PromptVariable, index: number) => {
    const value = formValues[variable.name] || '';
    const error = errors[variable.name];
    
    switch (variable.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <Input
            type={variable.type}
            value={value}
            onChange={(e) => handleInputChange(variable.name, e.target.value)}
            placeholder={variable.placeholder}
            className={error ? 'border-destructive' : ''}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(variable.name, e.target.value)}
            placeholder={variable.placeholder}
            className={error ? 'border-destructive' : ''}
          />
        );
      
      case 'long_text':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleInputChange(variable.name, e.target.value)}
            placeholder={variable.placeholder}
            rows={4}
            className={error ? 'border-destructive' : ''}
          />
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(variable.name, e.target.value)}
            className={error ? 'border-destructive' : ''}
          />
        );
      
      case 'dropdown':
        return (
          <Select value={value} onValueChange={(v) => handleInputChange(variable.name, v)}>
            <SelectTrigger className={error ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {(variable.options || []).length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  No options configured
                </div>
              ) : (
                (variable.options || []).map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        );
      
      case 'checkboxes':
        // Store selected values as comma-separated string
        const selected = value ? value.split(',').filter(Boolean) : [];
        return (
          <div className="space-y-2">
            {(variable.options || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No options configured</p>
            ) : (
              (variable.options || []).map((opt) => (
                <div key={opt} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selected.includes(opt)}
                    onCheckedChange={(checked) => {
                      const newSelected = checked
                        ? [...selected, opt]
                        : selected.filter(s => s !== opt);
                      handleInputChange(variable.name, newSelected.join(','));
                    }}
                  />
                  <Label className="font-normal">{opt}</Label>
                </div>
              ))
            )}
          </div>
        );
      
      case 'file':
        return (
          <Input
            type="text"
            disabled
            placeholder="File upload not supported in mocked test"
            className="bg-muted"
          />
        );
      
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(variable.name, e.target.value)}
            placeholder={variable.placeholder}
            className={error ? 'border-destructive' : ''}
          />
        );
    }
  };

  return (
    <div className="px-4 py-4 sm:p-6 max-w-3xl">
      <div className="space-y-2 mb-6">
        <h2 className="text-2xl font-semibold">Test Prompt</h2>
        <p className="text-sm text-muted-foreground">
          Test your prompt with the real AI model. Fill in the variables and click "Run Test" to generate output.
        </p>
      </div>

      {/* Model Status */}
      {!draftData.model_id ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No model selected. Please choose a model in the Model tab before running a test.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="mb-6 text-sm text-muted-foreground">
          Using model: <span className="font-medium text-foreground">{selectedModel?.name || 'Unknown'}</span> ({selectedModel?.provider_model || 'N/A'})
        </div>
      )}

      {/* Variable Input Form */}
      {variables.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-lg">
          <p className="text-muted-foreground">
            No variables defined yet. Add {'{{variables}}'} in the Prompt tab to test with inputs.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Variable Inputs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {variables.map((variable, index) => (
                <div key={variable.name} className="space-y-2">
                  <Label htmlFor={`var-${index}`}>
                    {variable.label || variable.name}
                    {variable.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {variable.description && (
                    <p className="text-xs text-muted-foreground">{variable.description}</p>
                  )}
                  {renderVariableInput(variable, index)}
                  {errors[variable.name] && (
                    <p className="text-xs text-destructive">{errors[variable.name]}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Run Test Button */}
          <Button 
            onClick={handleRunTest} 
            disabled={isRunning || !draftData.model_id || variables.length === 0}
            className="w-full"
            size="lg"
          >
            {isRunning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isRunning ? 'Generating...' : 'Run Test'}
          </Button>
        </div>
      )}

      {/* Error Display */}
      {generateMutation.isError && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{getErrorTitle(generateMutation.error.code)}</AlertTitle>
          <AlertDescription>
            {generateMutation.error.message}
          </AlertDescription>

          {generateMutation.error.code === 'RATE_LIMITED' && (
            <p className="mt-2 text-sm text-muted-foreground">
              You have reached the limit of 30 generations per 10 minutes. Please wait a bit before trying again.
            </p>
          )}

          {['MODEL_DISABLED', 'MODEL_NOT_FOUND', 'MODEL_AUTH_ERROR'].includes(
            generateMutation.error.code
          ) && (
            <p className="mt-2 text-sm text-muted-foreground">
              Please check your model configuration in the Model tab or contact an administrator.
            </p>
          )}
        </Alert>
      )}

      {/* Success Output */}
      {generateMutation.isSuccess && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Output</CardTitle>
            <Badge variant="outline">
              {generateMutation.data.usage.tokens} tokens
            </Badge>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm">
              {generateMutation.data.output}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
