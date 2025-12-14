/**
 * Grok (xAI) provider integration
 * Uses OpenAI-compatible API at https://api.x.ai/v1/chat/completions
 */

import { createError, ErrorCodes } from '../errors.ts';
import { estimateTokens } from '../interpolate.ts';

type MessageContent = string | Array<{
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string };
}>;

interface CallParams {
  apiKey: string;
  model: string;
  messages: Array<{ role: string; content: MessageContent }>;
  maxTokens: number;
  temperature: number;
  timeoutMs: number;
}

export async function callGrok(
  params: CallParams
): Promise<{ output: string; tokens: number }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), params.timeoutMs);

  try {
    // Strip images for Grok - convert multimodal content to text-only
    const textOnlyMessages = params.messages.map(msg => ({
      role: msg.role,
      content: typeof msg.content === 'string'
        ? msg.content
        : msg.content.filter(b => b.type === 'text').map(b => b.text || '').join('\n'),
    }));

    // Build request body - OpenAI-compatible format
    // Omit unsupported params for reasoning models: stop, presence_penalty, frequency_penalty, reasoning_effort
    const requestBody: Record<string, any> = {
      model: params.model,
      messages: textOnlyMessages,
      max_tokens: params.maxTokens,
      temperature: params.temperature,
    };

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${params.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // 401/403 → MODEL_AUTH_ERROR
      if (response.status === 401 || response.status === 403) {
        throw createError(
          ErrorCodes.MODEL_AUTH_ERROR,
          'Invalid or missing Grok API key. Please check your API credentials in Admin Providers.'
        );
      }
      
      // 429 → MODEL_RATE_LIMITED
      if (response.status === 429) {
        throw createError(
          ErrorCodes.MODEL_RATE_LIMITED,
          'Grok rate limit exceeded. Please try again later.'
        );
      }
      
      // 404 → MODEL_NOT_FOUND
      if (response.status === 404) {
        throw createError(
          ErrorCodes.MODEL_NOT_FOUND,
          `Model "${params.model}" not found at xAI`
        );
      }
      
      // 408/timeout → MODEL_TIMEOUT (handled separately in catch)
      if (response.status === 408) {
        throw createError(
          ErrorCodes.MODEL_TIMEOUT,
          'Grok request timed out'
        );
      }
      
      // 5xx → MODEL_UNAVAILABLE
      if (response.status >= 500) {
        throw createError(
          ErrorCodes.MODEL_UNAVAILABLE,
          'Grok service is temporarily unavailable. Please try again later.'
        );
      }
      
      // Other → PROVIDER_ERROR
      throw createError(
        ErrorCodes.PROVIDER_ERROR,
        errorData.error?.message || `Grok API error: ${response.status}`
      );
    }

    const data = await response.json();
    const output = data.choices?.[0]?.message?.content || '';
    
    // Map usage if available, otherwise estimate
    const tokens = data.usage?.total_tokens || estimateTokens(output);

    return { output, tokens };
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Handle AbortError (timeout)
    if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
      throw createError(
        ErrorCodes.MODEL_TIMEOUT,
        'Grok request timed out after 60 seconds'
      );
    }
    
    // Re-throw if already an error envelope
    if (error && typeof error === 'object' && 'code' in error) {
      throw error;
    }
    
    // Wrap unknown errors
    const errorMessage = error && typeof error === 'object' && 'message' in error
      ? String((error as any).message)
      : 'Unknown error';
    
    throw createError(
      ErrorCodes.PROVIDER_ERROR,
      `Grok request failed: ${errorMessage}`
    );
  }
}
