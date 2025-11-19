/**
 * Variable interpolation utilities
 */

/**
 * Replace {{variable_name}} tokens in prompt text with actual values
 * - Converts values to string and trims whitespace
 * - Leaves {{var}} as-is if value not provided
 * - Uses global replacement for each variable
 */
export function interpolateVariables(
  promptText: string,
  variables: Record<string, any>
): string {
  let result = promptText;
  
  for (const [key, value] of Object.entries(variables)) {
    const stringValue = String(value ?? '').trim();
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, stringValue);
  }
  
  return result;
}

/**
 * Validate that all required variables have values
 * Returns validation result with list of missing variables
 */
export function validateVariables(
  variables: Record<string, any>,
  variableSchema: Array<{ name: string; required?: boolean }>
): { valid: boolean; missing: string[] } {
  const requiredNames = variableSchema
    .filter(v => v.required)
    .map(v => v.name);
  
  const missing = requiredNames.filter(name => {
    const value = variables[name];
    return value === undefined || value === null || String(value).trim() === '';
  });
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Estimate token count from text (simple heuristic: chars / 4)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
