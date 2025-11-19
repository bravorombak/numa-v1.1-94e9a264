export interface PromptVariable {
  name: string;
  type: string;
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: string[];
  order?: number;
}

/**
 * Extract variable names from prompt text.
 * Detects patterns like {{variable_name}} where variable_name contains only letters, numbers, and underscores.
 * Returns unique variable names in order of first appearance.
 */
export function extractVariables(promptText: string): string[] {
  if (!promptText) return [];

  const regex = /\{\{([a-zA-Z0-9_]+)\}\}/g;
  const matches: string[] = [];
  const seen = new Set<string>();
  
  let match;
  while ((match = regex.exec(promptText)) !== null) {
    const varName = match[1];
    if (!seen.has(varName)) {
      seen.add(varName);
      matches.push(varName);
    }
  }
  
  return matches;
}

/**
 * Sync detected variables with existing variable configurations.
 * - Keeps all existing variable configs intact (even if no longer detected)
 * - Creates default configs for newly detected variables
 * - Does not delete orphaned variables
 */
export function syncVariablesFromDetected(
  detected: string[],
  existing: PromptVariable[] | null | undefined
): PromptVariable[] {
  const existingVars = existing || [];
  const existingNames = new Set(existingVars.map(v => v.name));
  const result = [...existingVars];
  
  // Add new variables with default config
  detected.forEach((varName, index) => {
    if (!existingNames.has(varName)) {
      result.push({
        name: varName,
        type: 'text',
        label: capitalizeFirst(varName),
        required: false,
        order: existingVars.length + index,
      });
    }
  });
  
  return result;
}

function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
