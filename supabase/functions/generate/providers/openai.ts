/**
 * OpenAI provider integration
 */

import { createError, ErrorCodes } from '../errors.ts';
import { estimateTokens } from '../interpolate.ts';

interface CallParams {
  apiKey: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  maxTokens: number;
  temperature: number;
  timeoutMs: number;
}

export async function callOpenAI(
  params: CallParams
): Promise<{ output: string; tokens: number }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), params.timeoutMs);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${params.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        max_completion_tokens: params.maxTokens,
        temperature: params.temperature,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        throw createError(
          ErrorCodes.MODEL_AUTH_ERROR,
          'Invalid OpenAI API key'
        );
      }
      
      if (response.status === 429) {
        throw createError(
          ErrorCodes.MODEL_RATE_LIMITED,
          'OpenAI rate limit exceeded'
        );
      }
      
      if (response.status === 404) {
        throw createError(
          ErrorCodes.MODEL_NOT_FOUND,
          `Model ${params.model} not found at OpenAI`
        );
      }
      
      if (response.status >= 500) {
        throw createError(
          ErrorCodes.MODEL_UNAVAILABLE,
          'OpenAI service is temporarily unavailable'
        );
      }
      
      throw createError(
        ErrorCodes.PROVIDER_ERROR,
        errorData.error?.message || `OpenAI API error: ${response.status}`
      );
    }

    const data = await response.json();
    const output = data.choices?.[0]?.message?.content || '';
    const tokens = data.usage?.total_tokens || estimateTokens(output);

    return { output, tokens };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
      throw createError(
        ErrorCodes.MODEL_TIMEOUT,
        'OpenAI request timed out after 60 seconds'
      );
    }
    
    if (error && typeof error === 'object' && 'code' in error) {
      throw error;
    }
    
    const errorMessage = error && typeof error === 'object' && 'message' in error
      ? String((error as any).message)
      : 'Unknown error';
    
    throw createError(
      ErrorCodes.PROVIDER_ERROR,
      `OpenAI request failed: ${errorMessage}`
    );
  }
}
