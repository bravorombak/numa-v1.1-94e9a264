/**
 * Anthropic (Claude) provider integration
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

export async function callAnthropic(
  params: CallParams
): Promise<{ output: string; tokens: number }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), params.timeoutMs);

  try {
    // Anthropic requires system message separate from messages array
    const systemMessage = params.messages.find(m => m.role === 'system')?.content || '';
    const userMessages = params.messages.filter(m => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': params.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: params.model,
        system: systemMessage,
        messages: userMessages,
        max_tokens: params.maxTokens,
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
          'Invalid Anthropic API key'
        );
      }
      
      if (response.status === 429) {
        throw createError(
          ErrorCodes.MODEL_RATE_LIMITED,
          'Anthropic rate limit exceeded'
        );
      }
      
      if (response.status === 404) {
        throw createError(
          ErrorCodes.MODEL_NOT_FOUND,
          `Model ${params.model} not found at Anthropic`
        );
      }
      
      if (response.status >= 500) {
        throw createError(
          ErrorCodes.MODEL_UNAVAILABLE,
          'Anthropic service is temporarily unavailable'
        );
      }
      
      throw createError(
        ErrorCodes.PROVIDER_ERROR,
        errorData.error?.message || `Anthropic API error: ${response.status}`
      );
    }

    const data = await response.json();
    const output = data.content?.[0]?.text || '';
    const inputTokens = data.usage?.input_tokens || 0;
    const outputTokens = data.usage?.output_tokens || 0;
    const tokens = inputTokens + outputTokens || estimateTokens(output);

    return { output, tokens };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
      throw createError(
        ErrorCodes.MODEL_TIMEOUT,
        'Anthropic request timed out after 60 seconds'
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
      `Anthropic request failed: ${errorMessage}`
    );
  }
}
