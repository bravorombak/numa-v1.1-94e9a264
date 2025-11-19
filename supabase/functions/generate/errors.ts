/**
 * Standardized error envelope system for the generate edge function
 */

export interface ErrorResponse {
  code: string;
  message: string;
  details: any;
  requestId: string;
}

/**
 * Create a standardized error response
 */
export function createError(
  code: string,
  message: string,
  details?: any
): ErrorResponse {
  return {
    code,
    message,
    details: details || null,
    requestId: crypto.randomUUID(),
  };
}

/**
 * Map error codes to HTTP status codes
 */
export function getStatusForErrorCode(code: string): number {
  const statusMap: Record<string, number> = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    RATE_LIMITED: 429,
    INVALID_REQUEST: 400,
    PROMPT_NOT_FOUND: 404,
    MODEL_NOT_FOUND: 404,
    MODEL_DISABLED: 400,
    MODEL_AUTH_ERROR: 401,
    MODEL_RATE_LIMITED: 429,
    MODEL_TIMEOUT: 504,
    MODEL_UNAVAILABLE: 503,
    INVALID_VARIABLES: 400,
    PROVIDER_ERROR: 500,
    INTERNAL_ERROR: 500,
  };
  return statusMap[code] || 500;
}

/**
 * Error codes used throughout the generate function
 */
export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  RATE_LIMITED: 'RATE_LIMITED',
  INVALID_REQUEST: 'INVALID_REQUEST',
  PROMPT_NOT_FOUND: 'PROMPT_NOT_FOUND',
  MODEL_NOT_FOUND: 'MODEL_NOT_FOUND',
  MODEL_DISABLED: 'MODEL_DISABLED',
  MODEL_AUTH_ERROR: 'MODEL_AUTH_ERROR',
  MODEL_RATE_LIMITED: 'MODEL_RATE_LIMITED',
  MODEL_TIMEOUT: 'MODEL_TIMEOUT',
  MODEL_UNAVAILABLE: 'MODEL_UNAVAILABLE',
  INVALID_VARIABLES: 'INVALID_VARIABLES',
  PROVIDER_ERROR: 'PROVIDER_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
