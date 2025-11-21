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
 * - Only includes variables currently detected in the prompt
 * - Preserves existing configs for variables that still exist
 * - Creates default configs for newly detected variables
 * - Removes configs for variables no longer in the prompt
 */
export function syncVariablesFromDetected(
  detected: string[],
  existing: PromptVariable[] | null | undefined
): PromptVariable[] {
  const existingVars = existing || [];
  const result: PromptVariable[] = [];
  
  // For each detected variable, use existing config or create default
  detected.forEach((varName, index) => {
    const existingVar = existingVars.find(v => v.name === varName);
    
    if (existingVar) {
      // Variable existed before - keep its configuration
      result.push(existingVar);
    } else {
      // New variable - create default configuration
      result.push({
        name: varName,
        type: 'text',
        label: capitalizeFirst(varName),
        required: true,
        order: index,
      });
    }
  });
  
  return result;
}

function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
