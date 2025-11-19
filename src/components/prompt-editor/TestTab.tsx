import { useState } from 'react';
import { usePromptEditorStore } from '@/stores/promptEditorStore';
import { useModels } from '@/hooks/useModels';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Info, Loader2 } from 'lucide-react';

const providerNames: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
  perplexity: 'Perplexity',
};

export const TestTab = () => {
  const { draftData } = usePromptEditorStore();
  const { data: models } = useModels();
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

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

  const generateMockResponse = (): string => {
    const modelInfo = selectedModel
      ? `${selectedModel.provider_model} (${providerNames[selectedModel.provider]})`
      : '(no model selected)';
    
    const filledVars = variables
      .map(v => `- ${v.label || v.name}: ${formValues[v.name] || '(empty)'}`)
      .join('\n');
    
    return `Mock response for "${draftData.title || 'Untitled'}"

Model: ${modelInfo}

Filled variables:
${filledVars}

---

This is a simulated response. In a future version, this will call the real /generate endpoint with your prompt and variables.

[The AI would process your prompt: "${draftData.prompt_text?.substring(0, 100)}..." and generate a real response based on the model and variables you provided.]`;
  };

  const handleRunTest = async () => {
    // Clear previous output
    setOutput(null);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Start loading
    setIsRunning(true);
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      const mockOutput = generateMockResponse();
      setOutput(mockOutput);
      setIsRunning(false);
    }, 1500);
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
    <div className="p-6 max-w-3xl">
      <div className="space-y-2 mb-6">
        <h2 className="text-2xl font-semibold">Test Prompt</h2>
        <p className="text-sm text-muted-foreground">
          Fill in variables and run a mock test. In this phase, the response is simulated; later it will call the real /generate endpoint.
        </p>
      </div>

      {/* Model Status */}
      {!draftData.model_id ? (
        <Alert variant="default" className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            No model selected. Go to the Model tab to choose a model. You can still run a mock test, but the model name will be shown as "(no model selected)".
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
            disabled={isRunning}
            className="w-full"
            size="lg"
          >
            {isRunning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isRunning ? 'Running Test...' : 'Run Test'}
          </Button>
        </div>
      )}

      {/* Output Panel */}
      {output && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Test Output</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md font-mono">
              {output}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
