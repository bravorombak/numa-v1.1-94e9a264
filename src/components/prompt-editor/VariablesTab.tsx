import { usePromptEditorStore } from '@/stores/promptEditorStore';
import type { PromptVariable } from '@/lib/variableDetection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

const variableTypes = [
  { value: 'text', label: 'Text (short)' },
  { value: 'long_text', label: 'Text (long)' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'URL' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'checkboxes', label: 'Checkboxes' },
  { value: 'file', label: 'File Upload' },
  { value: 'date', label: 'Date' },
];

const parseOptions = (optionsString: string): string[] => {
  if (!optionsString) return [];
  return optionsString
    .split(',')
    .map(opt => opt.trim())
    .filter(opt => opt.length > 0);
};

const formatOptions = (options: string[] | undefined): string => {
  if (!options || options.length === 0) return '';
  return options.join(', ');
};

export const VariablesTab = () => {
  const { draftData, updateDraftField } = usePromptEditorStore();

  const handleVariableChange = (index: number, partial: Partial<PromptVariable>) => {
    if (!draftData?.variables) return;
    const currentVars = Array.isArray(draftData.variables) 
      ? (draftData.variables as unknown as PromptVariable[])
      : [];
    const updated = [...currentVars];
    updated[index] = { ...updated[index], ...partial };
    updateDraftField('variables', updated);
  };

  if (!draftData) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Loading variables...</p>
      </div>
    );
  }

  const variables = Array.isArray(draftData.variables)
    ? (draftData.variables as unknown as PromptVariable[])
    : [];

  if (variables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h3 className="text-lg font-medium">No variables detected yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Add {'{{variables}}'} in the Prompt tab to start configuring them here.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {variables.map((variable, index) => (
        <Card key={`${variable.name}-${index}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono">
                {`{{${variable.name}}}`}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Variable Name (read-only) */}
            <div className="space-y-2">
              <Label htmlFor={`name-${index}`}>Variable Name</Label>
              <Input
                id={`name-${index}`}
                value={variable.name}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Name is derived from the prompt and cannot be changed here.
              </p>
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor={`type-${index}`}>Type</Label>
              <Select
                value={variable.type}
                onValueChange={(value) => handleVariableChange(index, { type: value })}
              >
                <SelectTrigger id={`type-${index}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {variableTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Label */}
            <div className="space-y-2">
              <Label htmlFor={`label-${index}`}>Label</Label>
              <Input
                id={`label-${index}`}
                value={variable.label || ''}
                onChange={(e) => handleVariableChange(index, { label: e.target.value })}
                placeholder="Label to show in forms"
              />
            </div>

            {/* Placeholder */}
            <div className="space-y-2">
              <Label htmlFor={`placeholder-${index}`}>Placeholder</Label>
              <Input
                id={`placeholder-${index}`}
                value={variable.placeholder || ''}
                onChange={(e) => handleVariableChange(index, { placeholder: e.target.value })}
                placeholder="Optional placeholder text"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor={`description-${index}`}>Description</Label>
              <Textarea
                id={`description-${index}`}
                value={variable.description || ''}
                onChange={(e) => handleVariableChange(index, { description: e.target.value })}
                placeholder="Optional helper text for users"
                className="min-h-[80px]"
              />
            </div>

            {/* Required */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`required-${index}`}
                checked={variable.required || false}
                onCheckedChange={(checked) => {
                  handleVariableChange(index, { required: checked as boolean });
                }}
              />
              <Label htmlFor={`required-${index}`} className="text-sm font-normal cursor-pointer">
                Required field
              </Label>
            </div>

            {/* Options (conditional for dropdown/checkboxes) */}
            {(variable.type === 'dropdown' || variable.type === 'checkboxes') && (
              <div className="space-y-2">
                <Label htmlFor={`options-${index}`}>
                  Options <span className="text-sm text-muted-foreground">(comma-separated)</span>
                </Label>
                <Input
                  id={`options-${index}`}
                  value={formatOptions(variable.options)}
                  onChange={(e) => {
                    const opts = parseOptions(e.target.value);
                    handleVariableChange(index, { options: opts });
                  }}
                  placeholder="Red, Blue, Green"
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
