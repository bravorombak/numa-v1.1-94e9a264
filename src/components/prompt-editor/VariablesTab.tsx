import React, { useState, useEffect } from 'react';
import { usePromptEditorStore } from '@/stores/promptEditorStore';
import type { PromptVariable } from '@/lib/variableDetection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Type as TextIcon,
  FileText,
  Hash,
  AtSign,
  Link2,
  ListFilter,
  CheckSquare,
  UploadCloud,
  Calendar,
} from 'lucide-react';

const VARIABLE_TYPE_OPTIONS: Array<{
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: 'text', label: 'Short Text', icon: TextIcon },
  { value: 'long_text', label: 'Long Text', icon: FileText },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'email', label: 'Email', icon: AtSign },
  { value: 'url', label: 'URL', icon: Link2 },
  { value: 'dropdown', label: 'Select', icon: ListFilter },
  { value: 'checkboxes', label: 'Multi-select', icon: CheckSquare },
  { value: 'file', label: 'File Upload', icon: UploadCloud },
  { value: 'date', label: 'Date', icon: Calendar },
];

const getVariableTypeOption = (value: string) => {
  return VARIABLE_TYPE_OPTIONS.find(opt => opt.value === value);
};

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
  
  // Local state for raw options input (preserves user typing)
  const [optionsInputs, setOptionsInputs] = useState<Record<string, string>>({});

  // Initialize options inputs when variables change
  useEffect(() => {
    if (!draftData?.variables) return;
    const variables = Array.isArray(draftData.variables)
      ? (draftData.variables as unknown as PromptVariable[])
      : [];
    
    const inputs: Record<string, string> = {};
    variables.forEach((variable, index) => {
      const key = `${variable.name}-${index}`;
      inputs[key] = formatOptions(variable.options);
    });
    setOptionsInputs(inputs);
  }, [draftData?.variables]);

  const handleVariableChange = (index: number, partial: Partial<PromptVariable>) => {
    if (!draftData?.variables) return;
    const currentVars = Array.isArray(draftData.variables) 
      ? (draftData.variables as unknown as PromptVariable[])
      : [];
    const updated = [...currentVars];
    updated[index] = { ...updated[index], ...partial };
    updateDraftField('variables', updated);
  };

  // Update local raw input text without parsing
  const handleOptionsChange = (index: number, varName: string, value: string) => {
    const key = `${varName}-${index}`;
    setOptionsInputs(prev => ({ ...prev, [key]: value }));
  };

  // Parse and save on blur
  const handleOptionsBlur = (index: number, varName: string, value: string) => {
    const opts = parseOptions(value);
    handleVariableChange(index, { options: opts });
    
    // Update local input to show clean formatted version
    const key = `${varName}-${index}`;
    setOptionsInputs(prev => ({ ...prev, [key]: formatOptions(opts) }));
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
            <CardTitle className="flex items-center gap-2 text-xl">
              <Badge variant="secondary" className="font-mono text-base px-3 py-1">
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

            {/* Variable Type */}
            <div className="space-y-2">
              <Label htmlFor={`type-${index}`}>Variable Type</Label>
              <Select
                value={variable.type}
                onValueChange={(value) => handleVariableChange(index, { type: value })}
              >
                <SelectTrigger id={`type-${index}`}>
                  {(() => {
                    const selectedOption = getVariableTypeOption(variable.type);
                    return selectedOption ? (
                      <div className="flex items-center gap-2">
                        <selectedOption.icon className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedOption.label}</span>
                      </div>
                    ) : (
                      <span>{variable.type}</span>
                    );
                  })()}
                </SelectTrigger>
                <SelectContent>
                  {VARIABLE_TYPE_OPTIONS.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4 text-muted-foreground" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Variable Title */}
            <div className="space-y-2">
              <Label htmlFor={`label-${index}`}>Variable Title</Label>
              <Input
                id={`label-${index}`}
                value={variable.label || ''}
                onChange={(e) => handleVariableChange(index, { label: e.target.value })}
                placeholder="Label to show in forms"
              />
            </div>

            {/* Helper Text */}
            <div className="space-y-2">
              <Label htmlFor={`description-${index}`}>Helper Text</Label>
              <Textarea
                id={`description-${index}`}
                value={variable.description || ''}
                onChange={(e) => handleVariableChange(index, { description: e.target.value })}
                placeholder="Write a short note to help users"
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
                  value={optionsInputs[`${variable.name}-${index}`] ?? formatOptions(variable.options)}
                  onChange={(e) => handleOptionsChange(index, variable.name, e.target.value)}
                  onBlur={(e) => handleOptionsBlur(index, variable.name, e.target.value)}
                  placeholder="Blog, Landing page, Ad copy"
                />
                <p className="text-sm text-muted-foreground">
                  Write choices with commas. Example: Red, Blue, Green.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
